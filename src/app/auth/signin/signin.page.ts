import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})

/**
 * Signin page for the app, allowing a user to sign in with their email and password
 */
export class SigninPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) {
  }

  /**
   * Give the HTML form access to these fields to display error messages
   *
   * @returns the email form element
   */
  get email() {
    return this.credentials.get('email');
  }

  /**
   * Give the HTML form access to these fields to display error messages
   *
   * @returns the password form element
   */
  get password() {
    return this.credentials.get('password');
  }

  /**
   * Create the default values for the credentials of the user and assign validations to them
   * Run when the page first opens
   */
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Sign in the user with the credentials they entered and navigate them to the main page
   */
  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.login(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.router.navigate(['/tabs']);
    } else {
      this.showAlert('Login failed', 'Please try again!');
    }
  }

  /**
   * Show an alert to the user if an error occurs while logging in
   *
   * @param header the header of the alert
   * @param message the message of the alert
   */
  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
