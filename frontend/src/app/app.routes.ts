import { Routes } from '@angular/router';

import { ProductManageComponent } from './@components/product-manage/product-manage.component';

import { HsCodeComponent } from './@components/hs-code/hs-code.component';

import { DashboardComponent } from './@components/dashboard/dashboard.component';
import { ProductsComponent } from './@components/Products/products.component';

export const routes: Routes = [
  {
    path: '',

    redirectTo: 'purchase',

    pathMatch: 'full',
  },

  {
    path: 'purchase',

    component: ProductsComponent,
  },

  {
    path: 'product-manage',

    component: ProductManageComponent,
  },

  {
    path: 'hs-code',

    component: HsCodeComponent,
  },

  {
    path: 'report',

    component: DashboardComponent,
  },
];
