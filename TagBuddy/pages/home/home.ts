import { Component, OnInit } from "@angular/core";
import {
  NavController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ChatsPage } from "../chats/chats";
import { RegPage } from "../reg/reg";
import { LoginPage } from "../login/login";
import { IonicPage } from 'ionic-angular';
import {
  LoadingController,
  ToastController
} from "ionic-angular";
import { AngularFirestore } from "angularfire2/firestore";
import { User } from "../../app/app.models";
import { ChatService } from "../../app/app.service";
import { appconfig } from "../../app/app.config";
import { AlertController } from 'ionic-angular';
import { getScrollData } from "ionic-angular/umd/components/input/input";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage implements OnInit {
  email: string;
  loginForm: any = {};

  constructor(
    public navCtrl: NavController,
    private db: AngularFirestore,
    private chatservice: ChatService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage,
    public alertCtrl: AlertController
    ) {}

  ngOnInit() {
    this.loginForm.email = "";
    this.loginForm.password = "";
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
        this.db.collection("users").doc(this.chatservice.caesarShift(this.loginForm.email,5)).ref.get().then( doc => {
         
          //console.log(user)
          if (!doc.exists) {
              const alert = this.alertCtrl.create({
                title: 'Hmmm!',
                subTitle: 'We can\'t seem to find the email you\'ve entered on our database',
                buttons: ['OK']
              });
              alert.present();
                  myLoader.dismiss();
            } else {
              //User already exists, move to chats page
             let user = doc.data();
                user.email = this.chatservice.caesarShift(user.email, -5);
                user.name = this.chatservice.caesarShift(user.name, -5);
                user.password = this.chatservice.caesarShift(user.password, -5);

                if(user.password === this.loginForm.password){
                  this.storage.set("chatuser", user);
                  
                  let toast = this.toastCtrl.create({
                    message: "Login In Successful",
                    duration: 3000,
                    position: "bottom"
                  });
                  toast.present();
                  myLoader.dismiss();
                
                  this.navCtrl.push(ChatsPage);
                }
                else{
                  const alert = this.alertCtrl.create({
                    title: 'Whoops!',
                    subTitle: 'Incorrect password! Try Again ...',
                    buttons: ['OK']
                  });
                  alert.present();
                  myLoader.dismiss();
                }
            }
        }).catch(function(error) {
          console.log("Error getting document:", error);
      });;
      });
    }
    else {
      const alert = this.alertCtrl.create({
        title: 'Whoops!',
        subTitle: 'Input your email and password!',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  reg(){
    this.navCtrl.push(RegPage);
  }
  getData(){

    this.db.collection("users").doc(this.chatservice.caesarShift(this.loginForm.email,5)).ref.get().then(function(doc) {
      if (doc.exists) {
          console.log("Document data:", doc.data());
      } else {
          console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}
  

}
 