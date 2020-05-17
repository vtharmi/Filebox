import { Component, OnInit, Output, OnDestroy } from '@angular/core';
import { FileService } from '../file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail-message',
  templateUrl: './detail-message.component.html',
  styleUrls: ['./detail-message.component.scss']
})
export class DetailMessageComponent implements OnInit, OnDestroy {
  selectedFile: any;
  numberofFilesSelectedMessage: string;
  showDelete = false;
  filesForDelete: string[] = [];
  selectIdSubscription: Subscription;
  deletedArray = [];
  fileData: string[] = [];
  selectAFileForMoreDetail = false;
  constructor(private fileService: FileService) { }

  ngOnInit() {
    this.selectIdSubscription = this.fileService.currentFile.subscribe(
      (fileData) => {
        if (fileData === '') {
          this.selectedFile = null;
          this.selectAFileForMoreDetail = true;
          this.numberofFilesSelectedMessage = null;
        }
        else {
          this.fileData = fileData;
          if ((this.fileData.length !== 0)) {
            // console.log("start final", this.fileData)
            let finalFileData = []

            for (let i = 0; i < this.fileData.length; i++) {
              if (!(this.deletedArray.includes(this.fileData[i]))) {
                finalFileData.push(fileData[i]);
              }
            }
            if (finalFileData.length === 0) {
              console.log("if", finalFileData)
              this.selectedFile = null;
              this.showDelete = false;
              // this.numberofFilesSelectedMessage = "select a file for more details";
              this.numberofFilesSelectedMessage = null;
              this.selectAFileForMoreDetail = true;
            }
            else if (finalFileData.length === 1) {
              // console.log("else if", finalFileData)
              this.selectAFileForMoreDetail = false;

              const fileData = this.fileService.getFile(finalFileData[0])
              fileData.fileSize = (this.fileService.bytesToSize(fileData.fileSize, 0.01))
              this.selectedFile = fileData;
              this.showDelete = false;
              this.numberofFilesSelectedMessage = null;
            }
            else {
              // console.log("else", finalFileData)
              this.selectAFileForMoreDetail = false;

              this.selectedFile = null;
              // console.log("in else", finalFileData);
              this.filesForDelete = finalFileData;
              this.numberofFilesSelectedMessage = `${finalFileData.length} files are selected`;
              this.showDelete = true;
            }
          }
        }

      }
    )
  }

  ngOnDestroy() {
    this.selectIdSubscription.unsubscribe();
  }

  onClickDelete(files: string[]) {

    let filesForDeleting = files;

    filesForDeleting.forEach(element => {
      if (!this.deletedArray.includes(element)) {
        this.deletedArray.push(element);
        const deletedElement = element;
        this.fileService.deleteFile(element);
        filesForDeleting = filesForDeleting.filter(element => element !== deletedElement);
        console.log("file length", filesForDeleting.length);
        if (filesForDeleting.length === 0) {
          this.numberofFilesSelectedMessage = "Select a file for more details";
          this.showDelete = false;
        }
      }
    });
  }
}
