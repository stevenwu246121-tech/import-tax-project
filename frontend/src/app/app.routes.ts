import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { DashboardHomeComponent } from './@components/dashboard-home/dashboard-home.component';
import { ProductManageComponent } from './@components/product-manage/product-manage.component';
import { HsCodeComponent } from './@components/hs-code/hs-code.component';
import { DashboardComponent } from './@components/dashboard/dashboard.component';
import { ProductsComponent } from './@components/products/products.component';
import { PosCheckoutComponent } from './@components/pos-checkout/pos-checkout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
      },
      {
        path: 'pos-checkout',
        component: PosCheckoutComponent,
      },
      {
        path: 'product-manage',
        component: ProductManageComponent,
      },
      {
        path: 'purchase',
        component: ProductsComponent,
      },
      {
        path: 'hs-code',
        component: HsCodeComponent,
      },
      {
        path: 'report',
        component: DashboardComponent,
      },
    ],
  },
];
