import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

//auth services
import { AuthService } from 'src/app/services/auth.service';

//angular form
import { NgForm } from '@angular/forms';

//rxjs finalize
import { finalize } from 'rxjs/operators';

//firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

//browser image resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from '../../../utils/config';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string =
    'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png';
  uploadPercent: number = null;
  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    const { email, password, username, country, bio, name } = f.form.value;

    //furthur sanitization of fields - do here

    this.auth
      .signUp(email, password)
      .then((res) => {
        console.log('RES:' + res);
        const { uid } = res.user;
        this.db.object(`/user/${uid}`).set({
          id: uid,
          name: name,
          email: email,
          instaUserName: username,
          country: country,
          bio: bio,
          picture: this.picture,
        });
      })
      .then(() => {
        this.router.navigateByUrl('/');
        this.toastr.success('Signup success!');
      })
      .catch((err) => {
        console.log('ERROR:' + err);
        this.toastr.error('Signup Failed.');
      });
  }

  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    //rename image with uuid
    const filepath = file.name;
    const fileref = this.storage.ref(filepath);

    const task = this.storage.upload(filepath, resizedImage);
    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileref.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('image uploaded successfully.');
          });
        })
      )
      .subscribe();
  }
}
