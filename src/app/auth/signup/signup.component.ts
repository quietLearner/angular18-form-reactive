import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  ValidatorFn,
} from '@angular/forms';

// function equalValues(control: AbstractControl): ValidationErrors | null {
//   const password = control.get('password')?.value;
//   const confirmPassword = control.get('confirmPassword')?.value;
//   // Empty fields have their own required errors.
//   if (!password || !confirmPassword) {
//     return null;
//   }
//   return password === confirmPassword ? null : { passwordsNotEqual: true };
// }

function equalValues(control1: string, control2: string): ValidatorFn {
  return (control) => {
    const value1 = control.get(control1)?.value;
    const value2 = control.get(control2)?.value;

    // Required validators handle empty fields.
    if (!value1 || !value2) {
      return null;
    }

    return value1 === value2 ? null : { passwordsNotEqual: true };
  };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  imports: [ReactiveFormsModule],
})
export class SignupComponent {
  submitted = false;
  completed = false;

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required],
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('', {
          nonNullable: true,
          validators: [Validators.minLength(3), Validators.required],
        }),
        confirmPassword: new FormControl('', {
          nonNullable: true,
          validators: [Validators.minLength(3), Validators.required],
        }),
      },
      {
        validators: [equalValues('password', 'confirmPassword')],
      },
    ),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    address: new FormGroup({
      street: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      number: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      postalCode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      city: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
    role: new FormControl('student', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    source: new FormArray([
      new FormControl(false, { nonNullable: true }),
      new FormControl(false, { nonNullable: true }),
      new FormControl(false, { nonNullable: true }),
    ]),
    agree: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  getErrorMessage(control: AbstractControl, label: string): string | null {
    if (!control.invalid || (!control.touched && !this.submitted)) {
      return null;
    }
    if (control.hasError('required')) {
      return control === this.form.controls.agree
        ? 'Please agree to the terms and conditions.'
        : `${label} is required.`;
    }
    if (control.hasError('email')) {
      return 'Enter a valid email address, such as name@example.com.';
    }
    if (control.hasError('minlength')) {
      return `${label} must contain at least ${control.getError('minlength').requiredLength} characters.`;
    }
    return null;
  }

  get confirmPasswordError(): string | null {
    const passwords = this.form.controls.passwords;
    const confirmPassword = passwords.controls.confirmPassword;
    const fieldError = this.getErrorMessage(
      confirmPassword,
      'Confirm password',
    );
    if (fieldError) {
      return fieldError;
    }
    if (
      (confirmPassword.touched || this.submitted) &&
      passwords.controls.password.valid &&
      confirmPassword.valid &&
      passwords.hasError('passwordsNotEqual')
    ) {
      return 'Passwords do not match.';
    }
    return null;
  }

  onReset() {
    this.submitted = false;
    this.completed = false;
    this.form.reset();
  }

  onSubmit() {
    this.submitted = true;
    this.completed = false;
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }
    this.completed = true;
  }
}
