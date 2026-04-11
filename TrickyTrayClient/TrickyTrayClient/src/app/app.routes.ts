import { Routes } from '@angular/router';
import { AdminGiftsComponent } from './components/admin/admin-gifts/admin-gifts';
import { AdminDonors } from './components/admin/admin-donors/admin-donors';
import { AdminSystemState } from './components/admin/admin-system-state/admin-system-state';
import { GiftDetailsComponent } from './components/user/gift-details/gift-details';
import { Checkout } from './components/user/checkout/checkout';
import { AdminOrdersReport } from './components/admin/admin-orders-report/admin-orders-report';

export const routes: Routes = [
  { path: '', redirectTo: 'gifts', pathMatch: 'full' },

  {
    path: 'gifts',
    loadComponent: () => import('./components/user/gifts-list/gifts-list').then(m => m.GiftsListComponent)
  },
  { path: 'gift/:id', component: GiftDetailsComponent },

  { path: 'checkout', component: Checkout },

  { path: 'admin/manage-gifts', component: AdminGiftsComponent },
  { path: 'admin/manage-donors', component: AdminDonors },
  { path: 'admin/manage-systemState', component: AdminSystemState },
  { path: 'admin/reports', component: AdminOrdersReport },


  { path: '**', redirectTo: 'gifts' }
];