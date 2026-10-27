import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';

describe('SignupComponent validation', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let component: SignupComponent;
  let page: HTMLElement;

  const messages = () =>
    Array.from(page.querySelectorAll('.control-error'), (element) =>
      element.textContent?.trim(),
    );

  function enter(id: string, value: string, blur = true) {
    const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (blur) {
      input.dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();
  }

  function submit() {
    page.querySelector('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  function fillValidForm() {
    enter('email', 'person@example.com');
    enter('password', 'abc123');
    enter('confirm-password', 'abc123');
    enter('first-name', 'Alex');
    enter('last-name', 'Smith');
    enter('street', 'Main Street');
    enter('number', '12A');
    enter('postal-code', '10001');
    enter('city', 'New York');
    page.querySelector<HTMLInputElement>('#terms-and-conditions')!.click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignupComponent] }).compileComponents();
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    page = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('keeps errors hidden until a field is touched', () => {
    expect(messages()).toEqual([]);
    enter('email', 'bad-email', false);
    expect(messages()).toEqual([]);
    page.querySelector('#email')!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(messages()).toEqual(['Enter a valid email address, such as name@example.com.']);
    expect(page.querySelector('#email')!.getAttribute('aria-invalid')).toBe('true');
    enter('email', 'person@example.com');
    expect(messages()).toEqual([]);
    expect(page.querySelector('#email')!.getAttribute('aria-invalid')).toBe('false');
  });

  it('reveals every missing required field on submit, including unchecked terms', () => {
    submit();
    expect(messages()).toEqual([
      'Email is required.',
      'Password is required.',
      'Confirm password is required.',
      'First name is required.',
      'Last name is required.',
      'Street is required.',
      'House number is required.',
      'Postal code is required.',
      'City is required.',
      'Please agree to the terms and conditions.',
    ]);
    expect(page.querySelector('[role="alert"]')).not.toBeNull();
    expect(component.completed).toBeFalse();
  });

  it('shows password length errors before a mismatch and handles empty confirmation', () => {
    enter('password', 'a');
    enter('confirm-password', 'b');
    expect(messages()).toEqual([
      'Password must contain at least 3 characters.',
      'Confirm password must contain at least 3 characters.',
    ]);
    enter('confirm-password', '');
    expect(messages()).toContain('Confirm password is required.');
    expect(messages()).not.toContain('Passwords do not match.');
  });

  it('reads the mismatch error from the password group and clears it when either value matches', () => {
    enter('password', 'abc');
    enter('confirm-password', 'xyz');
    expect(component.form.controls.passwords.hasError('passwordsNotEqual')).toBeTrue();
    expect(messages()).toEqual(['Passwords do not match.']);
    expect(page.querySelector('#confirm-password')!.getAttribute('aria-invalid')).toBe('true');
    enter('password', 'xyz');
    expect(messages()).toEqual([]);
    enter('password', 'abc');
    expect(messages()).toEqual(['Passwords do not match.']);
    enter('confirm-password', 'abc');
    expect(messages()).toEqual([]);
  });

  it('shows and clears agreement errors as the checkbox is toggled', () => {
    submit();
    const checkbox = page.querySelector<HTMLInputElement>('#terms-and-conditions')!;
    checkbox.click();
    fixture.detectChanges();
    expect(page.querySelector('#terms-error')).toBeNull();
    checkbox.click();
    fixture.detectChanges();
    expect(page.querySelector('#terms-error')!.textContent).toContain('Please agree');
    expect(component.form.invalid).toBeTrue();
  });

  it('provides a role error if the required selection is empty', () => {
    component.form.controls.role.setValue('');
    submit();
    expect(messages()).toContain('Role is required.');
  });

  it('accepts a valid form with all optional sources unchecked', () => {
    fillValidForm();
    submit();
    expect(component.form.valid).toBeTrue();
    expect(component.form.controls.source.value).toEqual([false, false, false]);
    expect(messages()).toEqual([]);
    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelector('[role="status"]')).not.toBeNull();
    enter('city', 'Boston');
    expect(page.querySelector('[role="status"]')).toBeNull();
  });

  it('clears errors and restores defaults when Reset is clicked', () => {
    fillValidForm();
    component.form.controls.role.setValue('teacher');
    page.querySelector<HTMLInputElement>('#google')!.click();
    submit();
    page.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    fixture.detectChanges();
    expect(messages()).toEqual([]);
    expect(component.submitted).toBeFalse();
    expect(component.completed).toBeFalse();
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
    expect(component.form.controls.email.value).toBe('');
    expect(component.form.controls.role.value).toBe('student');
    expect(component.form.controls.agree.value).toBeFalse();
    expect(component.form.controls.source.value).toEqual([false, false, false]);
    submit();
    expect(messages().length).toBe(10);
  });
});
