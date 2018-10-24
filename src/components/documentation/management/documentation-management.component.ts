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

const DocumentationManagementComponent: ng.IComponentOptions = {
  bindings: {
    resolvedPages: '<'
  },
  template: require('./documentation-management.html'),
  controller: function (
    NotificationService: NotificationService,
    DocumentationService: DocumentationService,
    $state: StateService
  ) {
    'ngInject';

    this.$onInit = () => {
      this.pages = this.resolvedPages;
      this.supportedTypes = DocumentationService.supportedTypes();
    };

    this.togglePublish = (page: any) => {
      page.published = !page.published;
      DocumentationService.partialUpdate("published", page.published, page.id).then( () => {
        NotificationService.show('Page ' + page.name + ' has been ' + (page.published ? '':'un') + 'published with success');
        DocumentationService.list().then( (response) => this.pages = response.data);
      });
    };

    this.upward = (page: any) => {
      page.order = page.order-1;
      DocumentationService.partialUpdate("order", page.order, page.id).then( () => {
        NotificationService.show('Page ' + page.name + ' order has been changed with success');
        DocumentationService.list().then( (response) => this.pages = response.data);
      });
    };

    this.downward = (page: any) => {
      page.order = page.order+1;
      DocumentationService.partialUpdate("order", page.order, page.id).then( () => {
        NotificationService.show('Page ' + page.name + ' order has been changed with success');
        DocumentationService.list().then( (response) => this.pages = response.data);
      });
    };

    this.remove = (page: any) => {
      DocumentationService.remove(page.id).then( () => {
        NotificationService.show('Page ' + page.name + ' has been removed');
        DocumentationService.list().then( (response) => this.pages = response.data);
      });
    };

    this.newPage = (type: string) => {
      $state.go('management.settings.newdocumentation', {type: type});
    };

    this.open = (page: any) => {
      if ('FOLDER' === page.type) {

      } else {
        $state.go('management.settings.editdocumentation', {pageId: page.id});
      }
    };
  }
};

export default DocumentationManagementComponent;
