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

import NotificationService from "../../../services/notification.service";
import DocumentationService from "../../../services/apiDocumentation.service";
import {StateService} from "@uirouter/core";
import {IScope} from "angular";

interface IPageScope extends IScope {
  getContentMode: string;
  fetcherJsonSchema: string;
}
const NewPageComponent: ng.IComponentOptions = {
  bindings: {
    resolvedFetchers: '<'
  },
  template: require('./new-page.html'),
  controller: function (
    NotificationService: NotificationService,
    DocumentationService: DocumentationService,
    $state: StateService,
    $scope: IPageScope
  ) {
    'ngInject';

    this.page = {
      name: "",
      type: $state.params.type
    };

    $scope.getContentMode = 'inline';

    this.codeMirrorOptions = {
      lineWrapping: true,
      lineNumbers: true,
      allowDropFileTypes: true,
      autoCloseTags: true,
      mode: "javascript"
    };


    this.$onInit = () => {
      this.fetchers = this.resolvedFetchers;

      if( DocumentationService.supportedTypes().indexOf(this.page.type) < 0) {
        $state.go("management.settings.documentation");
      }

      this.emptyFetcher = {
        "type": "object",
        "id": "empty",
        "properties": {"" : {}}
      };
      $scope.fetcherJsonSchema = this.emptyFetcher;
      this.fetcherJsonSchemaForm = ["*"];
    };

    this.configureFetcher = (fetcher) => {
      if (! this.page.source) {
        this.page.source = {};
      }

      this.page.source = {
        type: fetcher.id,
        configuration: {}
      };
      $scope.fetcherJsonSchema = JSON.parse(fetcher.schema);
    };

    this.save = () => {
      DocumentationService.create(this.page)
        .then( (response) => {
          NotificationService.show("'" + this.page.name + "' has been created");
          $state.go("management.settings.documentation");
      });
    };

    this.changeContentMode = (newMode) => {
      if ("fetcher" === newMode) {
        this.page.source = {
          configuration: {}
        };
      } else {
        delete this.page.source;
      }
    };

    this.cancel = () => {
      $state.go("management.settings.documentation");
    };
  }
};

export default NewPageComponent;
