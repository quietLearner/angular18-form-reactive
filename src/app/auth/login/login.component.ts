import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { delay, of, debounceTime } from 'rxjs';

function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }

  return { doesNotHaveQuestionMark: true };
}

function emailIsUnique(control: AbstractControl) {
  const isTaken = control.value === 'test@example.com';

  return of(isTaken ? { notUnique: true } : null).pipe(delay(1000));
}

let initialEmail = '';

const savedForm = window.localStorage.getItem('saved-login-form');

if (savedForm) {
  const loadedForm = JSON.parse(savedForm);
  initialEmail = loadedForm.email;
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl(initialEmail, {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique], //check if the email already exist?
    }),
    password: new FormControl('', {
      validators: [
        Validators.minLength(3),
        Validators.required,
        mustContainQuestionMark,
      ],
      asyncValidators: [],
    }),
  });

  //   Angular has three main validation statuses:
  // Status	Meaning
  // VALID	All validators have passed
  // INVALID	At least one validator has failed
  // PENDING	Asynchronous validation is still running

  ngOnInit() {
    //save email into lcoalstorage, when reload, the email still there
    this.form.controls.email.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (val) => {
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({
              email: val,
            }),
          );
        },
      });
  }

  get emailIsInvalid() {
    const email = this.form.controls.email;

    return email.invalid && email.touched;
  }

  get passwordIsInvalid() {
    const password = this.form.controls.password;

    return password.invalid && password.touched;
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form);
    const email = this.form.controls.email.value;
    const password = this.form.controls.password.value;
    console.log(email, password);
  }
}
