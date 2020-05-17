import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FileService } from '../file.service';
import { FileModel } from '../file-model';

@Component({
  selector: 'app-file-detail',
  templateUrl: './file-detail.component.html',
  styleUrls: ['./file-detail.component.scss']
})
export class FileDetailComponent implements OnInit {
  private id: string;
  private file: FileModel;
  constructor(private route: ActivatedRoute, private fileService: FileService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.file = this.fileService.getFile(this.id);
  }

}
