import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Alert } from '../../types/Alert';
import { Apollo } from 'apollo-angular';

@Component({
  selector: 'app-new-martialart',
  templateUrl: './new-martialart.component.html',
  styleUrls: ['./new-martialart.component.css']
})
export class NewMartialartComponent implements OnInit {

  form: FormGroup;
  alerts: Alert[] = [];

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      maName: ['', Validators.required],
      maStyle: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

}
