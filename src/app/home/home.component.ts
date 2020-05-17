import { Component, OnInit, OnDestroy} from '@angular/core';
import { FileService } from '../files/file.service';
import { FileModel } from '../files/file-model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  files: FileModel[] = [];
  file: FileModel;
  errorMessage: string;
  recentFileSubscription: Subscription;
  today = Date.now();
  constructor(private fileService: FileService){}

  ngOnInit() {
    this.fileService.getRecentFiles();
    this.fileService.filesChanged.subscribe(
      files => {
        this.files = files;
      }
    )
  }

  onDownload(filePath: string) {
    this.fileService.downloadFile(filePath);
  }
  onDelete(fileId: string){
    this.fileService.deleteRecentFile(fileId);
  }

  // ngOnDestroy() {
  //   this.recentFileSubscription.unsubscribe();
  // }
}
