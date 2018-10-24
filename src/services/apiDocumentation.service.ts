import {IHttpPromise} from "angular";

/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class DocumentationService {
  private folderPromise;

  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Constants: any) {
    'ngInject';
  }

  url = (apiId: string, pageId?: string): string => {
    if (apiId) {
      return `${this.Constants.baseURL}apis/${apiId}/pages/` + (pageId ? pageId : '');
    }
    return `${this.Constants.baseURL}portal/pages/` + (pageId ? pageId : '');

  };

  supportedTypes = (): string[] => {
    return ["SWAGGER", "MARKDOWN", "FOLDER"]
  };

  partialUpdate = (propKey: string, propValue: any, pageId: string, apiId?: string): IHttpPromise<any> => {
    let prop = {};
    prop[propKey] = propValue;
    return this.$http.patch(this.url(apiId, pageId), prop);
  };


  list = (apiId?: string): IHttpPromise<any> => {
    return this.$http.get(this.url(apiId));
  };

  remove = (pageId: string, apiId?: string): IHttpPromise<any> => {
    return this.$http.delete(this.url(apiId, pageId));
  };

  get2(pageId: string, apiId?: string): IHttpPromise<any> {
    return this.$http.get(this.url(apiId, pageId));
  }

  create(newPage: any, apiId?: string): IHttpPromise<any> {
    return this.$http.post(this.url(apiId), newPage);
  }






  fullList(apiId) {
    const deferredFolders = this.$q.defer();
    this.folderPromise = deferredFolders.promise;

    return this.$http.get(this.url(apiId), {params: {"flatMode": true}})
      .then(response => {

        let pages = <any[]>response.data;

        const map = new Map<string, string>();
        pages.forEach(p => {
          if (p.type === 'folder') {
            map.set(p.id, p.name);
          }
        });

        deferredFolders.resolve(map);

        return {pages: pages};
      });
  }

  getFolderPromise() {
    return this.folderPromise;
  }

  get(apiId: string, pageId?: string, portal?: boolean) {
    if (pageId) {
      return this.$http.get(this.url(apiId, pageId) + (portal !== undefined?'?portal=' + portal:''));
    }
  }

  getApiHomepage(apiId: string) {
    let deferred = this.$q.defer();
    let that = this;
    this.$http
      .get(this.url(apiId), {params:{"homepage": true}})
      .then(function(response) {
        if ((<any[]>response.data).length > 0) {
          that
            .get(apiId, response.data[0].id, true)
            .then(response => deferred.resolve(response));
        } else {
          deferred.resolve({});
        }
      })
      .catch( msg => deferred.reject(msg) );

    return deferred.promise;
  }

  listApiPages(apiId: string) {
    return this.$http
      .get(this.url(apiId), {params:{"homepage": false}})
  }

  getContentUrl(apiId, pageId) {
    return this.url(apiId, pageId) + '/content';
  }

  createPage(apiId, newPage) {
    return this.$http.post(this.url(apiId), newPage);
  }

  deletePage(apiId, pageId) {
    return this.$http.delete(this.url(apiId, pageId));
  }

  editPage(apiId, pageId, editPage) {
    return this.$http.put(this.url(apiId, pageId),
      {
        name: editPage.name,
        description: editPage.description,
        order: editPage.order,
        published: editPage.published,
        content: editPage.content || '',
        source: editPage.source,
        homepage: editPage.homepage,
        configuration: editPage.configuration,
        excluded_groups: editPage.excludedGroups,
        parentId: editPage.parentId
      }
    );
  }
}

export default DocumentationService;
