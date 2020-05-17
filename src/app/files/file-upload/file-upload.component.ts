import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileService } from '../file.service';
import { Observable, Subject } from 'rxjs';
import { HttpRequest, HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  filePreview: any;
  fileForm: FormGroup;

  constructor(private fb: FormBuilder, private fileService: FileService, private http: HttpClient, public dialog: MatDialog) { }

  ngOnInit() {
    this.fileForm = this.fb.group({
      fileUpload: [null, Validators.required]
    })
  }

  openUploadDialog() {
    let dialogRef = this.dialog.open(DialogComponent, { width: '75%', height: '65%' });
  }
  onSubmit() {
    // console.log("submitting")
  }



}
