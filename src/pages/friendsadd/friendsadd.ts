import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';
import { Chat } from "../../app/app.models";
import { Storage } from "@ionic/storage";
import { ChatService } from "../../app/app.service";
import { appconfig } from "../../app/app.config";
import { Firebase } from '@ionic-native/firebase';
import firebase, { storage } from "firebase"


import { OnInit } from "@angular/core";
import { ModalController } from "ionic-angular";
import {
  AngularFirestoreDocument,
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";

import { User, Test } from "../../app/app.models";
import { Observable } from "rxjs/Observable";



import { ChatroomPage } from "../chatroom/chatroom";

import { diPublic } from "@angular/core/src/render3/instructions";
import { checkAndUpdateElementInline } from '@angular/core/src/view/element';
import { from } from 'rxjs';
import { firestore } from 'firebase';

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
  private db: AngularFirestore
  Friend;
  friendertime:number;
  friendtime: number;
  pairId: string;

  user: AngularFirestoreCollection<User>;
  private test: AngularFirestoreDocument<Test>;

  firebase: Firebase
  friendsForm: any = {
    email : "test"
  };
  constructor(private storage: Storage, private nfc: NFC, private ndef: Ndef) { };
 
  ngOnInit() {
    this.storage.get("chatuser").then(chatuser => {
    this.chatuser = chatuser.email; 
    console.log(chatuser.email) 
    });

    // this.storage.get("friends").then(friendsStorage => {
    //   this.friendsForm = friendsStorage;
    //   this.friendsStorage = friendsStorage; 
    //   console.log(friendsStorage); 
    //   });
  }
    

  addUsername(){

    this.pairId = this.email + "|" + this.chatuser;
    //this.storage.set("pairId", this.) = this.pairId;
    this.storage.set('pairId', this.pairId);
  

    var friendsForm = firebase.firestore().collection('users').doc(this.chatuser).get();

    firebase.firestore().collection('users').add({
      friender: this.chatuser,
      friend: this.email,
      pairId: this.pairId
    })
    firebase.firestore().collection('users').add({
      friender: this.email,
      friend: this.chatuser,
      pairId: this.pairId
    })
  
 
      
  // var user = firebase.firestore().collection('users').doc(this.chatuser);
  // var friend = firebase.firestore().collection('users').doc(this.email);


  //   user.update({
  //     friends: firestore.FieldValue.arrayUnion(this.email)
  // });
  //   friend.update({
  //     friends: firestore.FieldValue.arrayUnion(this.chatuser)
  // });
}

//Runtime error get nfc working!!!
addNFC(){
  // listen for friend
  // send out credentials
  this.nfc.addNdefListener(() => {
     console.log('successfully attached ndef listener');
  }, (err) => {
    console.log('error attaching ndef listener', err);
  }).subscribe((event) => {
    console.log('received ndef message. the tag contains: ', event.tag);
    console.log('decoded tag id', this.nfc.bytesToHexString(event.tag.id));
  
    let message = this.ndef.textRecord('Hello world');
    this.nfc.share([message]);//.then(onSuccess).catch(onError);

  })
  
  
}
  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendsaddPage');
  }
}
