import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  users = [];
  posts = [];

  isLoading = false;

  constructor(private db: AngularFireDatabase, private toastr: ToastrService) {
    this.isLoading = true;

    //getting all users
    db.object('/user')
      .valueChanges()
      .subscribe((objects) => {
        if (objects) {
          this.users = Object.values(objects);
          this.isLoading = false;
        } else {
          toastr.error('No User Found.');
          this.users = [];
          this.isLoading = false;
        }
      });

    //getting all posts
    db.object('/post')
      .valueChanges()
      .subscribe((objects) => {
        if (objects) {
          this.posts = Object.values(objects).sort((a, b) => b.date - a.date);
          this.isLoading = false;
        } else {
          toastr.error('No Posts Yet!');
          this.posts = [];
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {}
}
