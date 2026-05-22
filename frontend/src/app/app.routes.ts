import { Routes } from '@angular/router';

import { ProductsComponent }
from './@components/products/products.component';

import { HsCodeComponent }
from './@components/hs-code/hs-code.component';

export const routes: Routes = [
  {path: '',component: ProductsComponent},

  {path: 'hs-code',component: HsCodeComponent}
];
