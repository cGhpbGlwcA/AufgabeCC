import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Mitarbeiter } from './Mitarbeiter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'AufgabeCC';

  /**
   * Github-API - source of data 
   */
  url = "https://api.github.com/orgs/codecentric/members";

  /**
   *  Aufgabe 1: base data
   */
  mitarbeiterArray:     any = [];

  /**
   * Aufgabe 2: language statistic grouped by employee.
   */
  mitarbeierStatistic:  any = [];

  /**
   * Aufgabe 3: filtered employees for search language function
   */
  mitarbeierFilter:     any = [];

  /**
   * search value (language)
   */
  searchValue = "";

  //----------------------------------------------------------

  constructor (private http: HttpClient)
  {

  }

  //----------------------------------------------------------
  
  /**
   * Load all content from Github. 
   */
  loadContent(): void
  { 
    // reset
    this.mitarbeiterArray = [];

    this.http.get(this.url).subscribe((response: any) =>{
      var baseContent = response;
       
      for(let user of baseContent){
        this.http.get(user.repos_url).subscribe((repoResponse: any) =>{
          var userContent = repoResponse;

          for(let repo of userContent){
            let mitarbeiter = new Map<string, string>();
            mitarbeiter.set("login", user.login);
            mitarbeiter.set("repo", user.repos_url);
            mitarbeiter.set("language", repo.language);
            this.mitarbeiterArray.push(mitarbeiter);
            /*mitarbeiter: Mitarbeiter = {
              login: user.login,
              repo: user.repos_url,
              language: repo.language
            }*/
          }
        });
      }
    });
  }

  //----------------------------------------------------------

  /**
   * Button Click - count Languages group by mitarbeiter
   */
  countLanguagesByMitarbeier(): void
  {
    // reset 
    this.mitarbeierStatistic = [];

    if(this.mitarbeiterArray !== undefined)
    {
      let userMap = new Map<string, any>();

      for(let mitarbeiter of this.mitarbeiterArray)
      {
        var login = mitarbeiter.get('login');

        if(userMap.has(login)) {
          languages = this.getLanguagesCounts(userMap, login, mitarbeiter);
        }
        else
        {
          // initialize employee/langauge entry
          var languages = new Map<string, number>();
          languages.set(mitarbeiter.get('language'), 1);
          userMap.set(login, languages);
        }
      }

      // convert map to array
      for(let item of userMap)
      { 
        this.mitarbeierStatistic.push(item);
      }
    }
  }

  private getLanguagesCounts(userMap: Map<string, any>, login: any, mitarbeiter: any) {
    {
      var languages = userMap.get(login);

      var language = mitarbeiter.get('language');
      if (language === undefined) {
        // mark undefined languages as unknown
        language = 'unknown';
      }

      if (languages === undefined || languages === null) {
        // initialize language map
        languages = new Map<string, number>();
      }

      if (languages.has(language)) {
        //map contains specific language
        var counter = languages.get(language);

        if (counter === undefined) {
          // initialize counter
          counter = 0;
        }

        // increase counter
        languages.set(language, counter + 1);
      }

      else {
        // set new language entry
        languages.set(language, 1);
      }

      // add/overwrite entry
      userMap.set(login, languages);
    }
    return languages;
  }

  //----------------------------------------------------------

  /**
   * Create display content for employee.
   * @param map 
   * @returns 
   */
  getContent(map: Map<string, any>): string
  {
    var content = "";

    if(map !== null)
    {
      for(let item of map)
      {
        content += '- ' + item[0] + ' ' + item[1] +'\n';
      }
    }

    return content;
  }

  //----------------------------------------------------------

  /**
   * Button Click - start search language
   */
  startSearch(): void
  {
    this.mitarbeierFilter = [];

    if(this.searchValue !== null &&
      this.searchValue !== undefined &&
      this.searchValue !== '' &&
      this.mitarbeiterArray !== undefined
      )
    {
      for(let mitarbeiter of this.mitarbeiterArray)
      {
        if(mitarbeiter.get('language') === this.searchValue)
        {
          if(this.contians(this.mitarbeierFilter, mitarbeiter.get('login')))
          {
            this.mitarbeierFilter.push(mitarbeiter.get('login'));
          }
        }
      }
    }

    console.log('Filter: '+ this.mitarbeierFilter);
  }

  //----------------------------------------------------------

  /**
   * check array for specific string.
   * @param array 
   * @param value 
   * @returns 
   */
  contians(array: any[], value: string): boolean
  {
    var returnValue = true;
    
    for(let item of array)
    {
      if(item === value)
      {
        returnValue = false;
      }
    }

    return returnValue;
  }

  //----------------------------------------------------------
}
