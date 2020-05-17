import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FileModel } from '../file-model';
import { FileService } from '../file.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, OnDestroy {
  fileId: string;
  files: Array<FileModel> 
  pageTitle: string = "Filebox";
  fileChangesubcription: Subscription;
  queryParamSubscription: Subscription;
  _listfilter: string;
  errorMessage: string;
  allSelected = false;

  get listFilter(): string{
    return this._listfilter;
  }

  set listFilter(value: string) {
    this._listfilter = value;
    this.filteredFiles = this._listfilter ? this.performFilter(this._listfilter): this.files;
  }

  fileIds = [];
  filteredFiles: FileModel[];

  performFilter(filterBy: string): FileModel[] {
    try {
      filterBy = filterBy.toLocaleLowerCase();
      return this.files.filter((file: FileModel) => 
        file.fileName.toLocaleLowerCase().indexOf(filterBy) !== -1)
    } catch(e) {
      // console.log(e);
    }
   
  }
 
  //  selectAll(){
  //   let items=document.getElementsByName('select item');
  //   for(var i=0; i<items.length; i++){
  //     const input = ('item')[i] as HTMLInputElement;
  //     if(input.type=='checkbox')
  //       input.checked=true;
  //   }
  // }
  constructor(private fileService: FileService, private route: ActivatedRoute) {}
  
  ngOnInit(): void {
   
    this.queryParamSubscription = this.route.queryParamMap.subscribe(queryParams => {
      this.listFilter = queryParams.get('filterBy') || '';
    })
    this.fileService.getFiles();


    this.fileChangesubcription = this.fileService.filesChanged.subscribe(
    {
        next: (files) => {
        this.files = files
        this.filteredFiles = this.performFilter(this.listFilter);
        },
        error: err => this.errorMessage = err
      }
    )
  }

  ngOnDestroy() {
    this.fileChangesubcription.unsubscribe();
    this.queryParamSubscription.unsubscribe()
  }
  
 
  onRename(fileId: string) {
    console.log(fileId)
    const renameInput = document.getElementById('rename') as HTMLInputElement;
    console.log(renameInput)
    const initialName = renameInput.value;
    const renameArray = renameInput.value.split('.');
    const strlength = (renameArray.slice(0, -1).join('.')).length;
    console.log(renameArray.slice(0, -1).join('.'))
    renameInput.selectionStart = 0;
    renameInput.selectionEnd = strlength;
    renameInput.focus()
    renameInput.onchange = function() {
      return renameInput;
      // renameInput.value.split('.').slice(0, -1).join('.') + '.' + renameArray[renameArray.length - 1];
      // console.log(renameInput);
      // this.fileService.renameFile(fileId, finalName);
    }
    if(renameInput.onchange && initialName !== renameInput.value) {
      this.fileService.renameFile(fileId, renameInput.value);
    }
   
    // return fileId;
  }

  onDownload(filePath: string) {
    this.fileService.downloadFile(filePath);
  }
  onDelete(fileId: string){
    this.fileService.deleteFile(fileId);
  }

  checkChange(fileId: string) {
    if(!this.fileIds.includes(fileId)) {
      this.fileIds.push(fileId);
      this.fileService.changeFile(this.fileIds)
      // if(this.fileIds.length == 1) {
      //   const fileData =this.fileService.getFile(this.fileIds[0])
      //   this.fileService.changeFile(fileData);
      // }
      // else if(this.fileIds.length > 1){
      //   this.fileService.changeFile(`${this.fileIds}-${this.fileIds.length} files are selected`);
      // }
      // else{
      //   this.fileService.changeFile('');
      // }
    }
    else {
      let index = this.fileIds.indexOf(fileId);
      if(index > -1) {
        console.log("fieldsIs", this.fileIds)
        this.fileIds.splice(index, 1);
        console.log("fieldsIs", this.fileIds)
        if(this.fileIds.length < 1) {
          this.fileService.changeFile('');
        }
        else{
          this.fileService.changeFile(this.fileIds);
        }
      }

    }
  }
}
