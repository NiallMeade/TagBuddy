import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import { Chat } from "../../app/app.models";
import { Storage } from "@ionic/storage";
import { ChatService } from "../../app/app.service";
import { appconfig } from "../../app/app.config";
import { Firebase } from '@ionic-native/firebase';
import firebase, { storage } from "firebase"

import { ChatsPage } from "../chats/chats";
import { OnInit } from "@angular/core";
import { ModalController } from "ionic-angular";
import {
  AngularFirestoreDocument,
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";

import { User, Friend } from "../../app/app.models";
import { Observable } from "rxjs/Observable";



import { ChatroomPage } from "../chatroom/chatroom";

import { diPublic } from "@angular/core/src/render3/instructions";
import { checkAndUpdateElementInline } from '@angular/core/src/view/element';
import { from } from 'rxjs';
import { firestore } from 'firebase';
import { AlertController } from 'ionic-angular';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
/**
 * Generated class for the FriendsaddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-friendsadd',
  templateUrl: 'friendsadd.html',
})
export class FriendsaddPage {
  
  chatPayload: Chat;
  email: string;
  name: string;
  chatuser: string;
  friendsStorage: string;
  private chatService: ChatService;
  //private db: AngularFirestore
  Friend;
  friendertime:number;
  friendtime: number;
  pairId: string;
  
  user: AngularFirestoreCollection<User>;
  //private test: AngularFirestoreDocument<Test>;

  firebase: Firebase

  constructor(
    private storage: Storage, 
    private nfc: NFC, 
    private ndef: Ndef,  
    private chatservice: ChatService,
    private db: AngularFirestore,
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController
    ) { };
 
  ngOnInit() {
    this.storage.get("chatuser").then(chatuser => {
    this.chatuser = chatuser.name;  
    });
  }
    
  
  addUsername(){
    console.log(this.chatuser);
    this.pairId = this.name + "|" + this.chatuser;
    this.storage.set('pairId', this.pairId);

    this.chatuser = this.chatservice.caesarShift(this.chatuser, 5);
    this.pairId = this.chatservice.caesarShift(this.pairId,5);
    this.name = this.chatservice.caesarShift(this.name, 5);

    
    this.db
        .collection<Friend>(appconfig.friends_endpoint, res => {
          return res.where("pairId", "==",this.pairId);
        })
        .valueChanges()
        .subscribe(users => {
          if(users.length == 0){
            let time = new Date().getTime();
            this.db.collection("friends").doc(time.toString()+"_1").set({
              friender: this.chatuser,
              friend: this.name,
              pairId: this.pairId
            })
        
            this.db.collection("friends").doc(time.toString()+"_2").set({
              friender: this.name,
              friend: this.chatuser,
              pairId: this.pairId
            })
          }
        });
 
 let toast = this.toastCtrl.create({
        message: "Friend Added",
        duration: 3000,
        position: "bottom"
      });
      toast.present();
      this.navCtrl.push(ChatsPage);
}

//Runtime error get nfc working!!!
addNFC(){
  // listen for friend
  // send out credentials
  this.nfc.addNdefListener(() => {
     console.log('successfully attached ndef listener');
     this.name = "success"
  }, (err) => {
    console.log('error attaching ndef listener', err);
    
  }).subscribe((event) => {
    console.log('received ndef message. the tag contains: ', event.tag);
    console.log('decoded tag id', this.nfc.bytesToHexString(event.tag.id));
    this.name = this.nfc.bytesToString(event.tag.ndefMessage[0]["payload"]).substring(3);
    const confirm = this.alertCtrl.create({
      title: 'Add this friend?',
      message: 'Do you want to add '+this.name+' to your friends list?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            confirm.dismiss();
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.addUsername();
            confirm.dismiss();
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  });
  let message = this.ndef.textRecord(this.chatuser.toString());
  this.nfc.share([message]);
}
  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendsaddPage');
  }
}
