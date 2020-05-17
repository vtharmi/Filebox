import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FileService } from '../file.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @ViewChild('file') file;

  public files: Set<File> = new Set();

  constructor(public dialogRef: MatDialogRef<DialogComponent>, public fileService: FileService) { }

  ngOnInit() { }

  progress;
  canBeClosed = false;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
    this.canBeClosed = true;

  }

  addFiles() {
    this.file.nativeElement.click();
  }

  onRemoveFile(file) {
    this.files.delete(file); 
    if(this.files.size == 0) {
      this.canBeClosed = false;
    }
  }

  closeDialog() {
    if (this.uploadSuccessful) {
      return this.dialogRef.close();
    }
    this.uploading = true;
    this.progress = this.fileService.upload(this.files);
    console.log(this.progress);
    for (const key in this.progress) {
      this.progress[key].progress.subscribe(val => console.log(val));
    }
    let allProgressObservables = [];
    for (let key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
    }

    this.primaryButtonText = 'Finish';
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;
    this.showCancelButton = false;

    forkJoin(allProgressObservables).subscribe(end => {
      this.canBeClosed = true;
      this.dialogRef.disableClose = true;
      this.uploadSuccessful = true;
      this.uploading = false;
    });
  }
}
