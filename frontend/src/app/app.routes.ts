import { Routes } from '@angular/router';
import { PublisherComponent } from './components/publisher/publisher';
import { SubscriberComponent } from './components/subscriber/subscriber';

export const routes: Routes = [
  { path: 'publisher', component: PublisherComponent },
  { path: 'subscriber', component: SubscriberComponent },
  { path: '', redirectTo: '/subscriber', pathMatch: 'full' }
];
