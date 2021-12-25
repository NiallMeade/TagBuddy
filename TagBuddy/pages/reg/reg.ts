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
import { AlertController } from 'ionic-angular';
/**
 * Generated class for the RegPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reg',
  templateUrl: 'reg.html',
})
export class RegPage {
  email: string;
  loginForm: any = {};
  emailOk: boolean;
  done: boolean = false;
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
    
  }

  addUser(payload : any = {}) {
    payload.email = this.chatservice.caesarShift(payload.email, 5);
    payload.name = this.chatservice.caesarShift(payload.name, 5);
    payload.password = this.chatservice.caesarShift(payload.password, 5);
    payload.gender = payload.gender;
    payload.active = "false";
    payload.time = payload.time;
    //check for user already created

    //add the bot chat 
    this.db.collection("friends").doc(payload.time.toString()).set({
      friender: payload.name,
      friend: this.chatservice.caesarShift("Buddy", 5),
      pairId: payload.name + "|" + this.chatservice.caesarShift("Buddy", 5),
    });

    return this.db.collection("users").doc(payload.email).set(payload);
  } //addUser

  regUser() {
    if (this.loginForm.email != "" && this.loginForm.name != "" && this.loginForm.password != "") {
      //check email and password



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
            if(users.length != 0){
              this.emailOk = false;
            }
            else{
              this.emailOk = true;
            }  
            
          });

          this.db
          .collection<User>(appconfig.users_endpoint, ref => {
            return ref.where("name", "==", this.chatservice.caesarShift(this.loginForm.name, 5));
          })
          .valueChanges()
          .subscribe(users => {
            console.log(this.emailOk)
            if(users.length==0&&this.emailOk){
              this.loginForm.time = new Date().getTime();
              this.done = true;
              this.addUser(this.loginForm)
                .then(res => {
                this.loginForm.email = this.chatservice.caesarShift(this.loginForm.email, -5);
                this.loginForm.name = this.chatservice.caesarShift(this.loginForm.name, -5);
                this.loginForm.password = this.chatservice.caesarShift(this.loginForm.password, -5);
                //Registration successful, go to chats page
                this.storage.set("chatuser", this.loginForm);
                myLoader.dismiss();
                

                const confirm = this.alertCtrl.create({
                  title: 'Tag Buddy - Terms of Use',
                  message: 'Do you agree to to be kind to others when using and treat everyone fairly?',
                  buttons: [
                    {
                      text: 'Disagree',
                      handler: () => {
                        const toast = this.toastCtrl.create({
                          message: 'Cannot proceed until the agreement is accepted',
                          duration: 3000,
                          position: 'bottom'
                        });
                        toast.present();
                      }
                    },
                    {
                      text: 'Agree',
                      handler: () => {
                        this.navCtrl.push(ChatsPage);
                      }
                    }
                  ]
                  });
                  confirm.present();
                return;
              })
              .catch(err => {
                console.log(err);
                myLoader.dismiss();
              });
          } else if(this.done==false){
            if(this.emailOk==false&&users.length==0){
              const alert = this.alertCtrl.create({
                title: 'Hmmm!',
                subTitle: 'It appears we have an account registered under this email!',
                buttons: ['OK']
              });
              alert.present();
              myLoader.dismiss();
          }
          else if(users.length!=0&&this.emailOk){
            const alert = this.alertCtrl.create({
              title: 'Whoops!',
              subTitle: 'This username is already taken!',
              buttons: ['OK']
            });
            alert.present();
            myLoader.dismiss();
          }
          else if(users.length!==0&&!this.emailOk){
            console.log(users[0]);
            console.log(this.emailOk)
            const alert = this.alertCtrl.create({
              title: 'Hmmm!',
              subTitle: 'This account has already been registered ... return to the login page and try to login!',
              buttons: ['OK']
            });
            alert.present();
            myLoader.dismiss();
          }
          }
          });
      });
    } else {
      const alert = this.alertCtrl.create({
        title: 'Whoops!',
        subTitle: 'Make sure all fields are populated before you try to register an account!',
        buttons: ['OK']
      });
      alert.present();
    }
  }
}



