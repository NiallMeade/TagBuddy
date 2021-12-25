import { IonicPage } from 'ionic-angular';
import { Component} from "@angular/core";
import {
  NavController,
  LoadingController,
  ToastController
} from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { User } from "../../app/app.models";
import { ChatService } from "../../app/app.service";
import { Storage } from "@ionic/storage";
import { ChatsPage } from "../chats/chats";
import { appconfig } from "../../app/app.config";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email: string;
  loginForm: any = {};
  constructor(
    public navCtrl: NavController,
    private db: AngularFirestore,
    private chatservice: ChatService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.storage.get("chatuser").then(chatuser => {
      if (chatuser && chatuser.email !== "") {
        this.navCtrl.push(ChatsPage);
      }
    });
  }

  loginUser() {
    if (this.loginForm.email != "" && this.loginForm.password != "") {
      this.storage.set('loginForm', this.loginForm);

      //Check if email already exists
      let myLoader = this.loadingCtrl.create({
        content: "Please wait..."
      });
      myLoader.present().then(() => {
        this.db
          .collection<User>(appconfig.users_endpoint, ref => {
            return ref.where("email", "==", this.chatservice.caesarShift(this.loginForm.email, 5));
          })
          .valueChanges()
          .subscribe(users => {
            console.log(users);

            if (users.length === 0) {

                  let toast = this.toastCtrl.create({
                    message: "email not registered",
                    duration: 3000,
                    position: "top"
                  });
                  toast.present();
                  myLoader.dismiss();
            } else {
              //User already exists, move to chats page
                users[0].email = this.chatservice.caesarShift(users[0].email, -5);
                users[0].name = this.chatservice.caesarShift(users[0].name, -5);
                users[0].password = this.chatservice.caesarShift(users[0].password, -5);

                if(users[0].password === this.loginForm.password){
                  this.storage.set("chatuser", users[0]);
                  
                  let toast = this.toastCtrl.create({
                    message: "Login In Successful",
                    duration: 3000,
                    position: "top"
                  });
                  toast.present();
                  myLoader.dismiss();
                
                  this.navCtrl.push(ChatsPage);
                }
                else{
                  let toast = this.toastCtrl.create({
                    message: "Incorrect Password",
                    duration: 3000,
                    position: "top"
                  });
                  toast.present();
                  myLoader.dismiss();
                }
            }
          
        });
      });
    }
    else {
      let toast = this.toastCtrl.create({
        message: "Missing region",
        duration: 3000,
        position: "top"
      });
      toast.present();
    }
  }
}
  
