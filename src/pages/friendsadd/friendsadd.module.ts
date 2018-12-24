import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendsaddPage } from './friendsadd';

@NgModule({
  declarations: [
    FriendsaddPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendsaddPage),
  ],
})
export class FriendsaddPageModule {}
