import { Injectable } from '@angular/core';
import { Subject, throwError, Observable, BehaviorSubject, pipe } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { FileModel } from './file-model';
import { map, catchError, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';


@Injectable({
    providedIn: 'root'
})


export class FileService {
    private selectedFile: any =  new BehaviorSubject('');
    currentFile = this.selectedFile.asObservable();
    fileSelectedData: any;
    filesChanged = new Subject<FileModel[]>();
    uploadedFiles: FileModel[] = [];
    recentFiles: FileModel[] = [];
    constructor(private http: HttpClient, private datePipe: DatePipe) { }

     bytesToSize(bytes, precision) {
        let kilobyte = 1024;
        let megabyte = kilobyte * 1024;
        let gigabyte = megabyte * 1024;
        let terabyte = gigabyte * 1024;
       
        if ((bytes >= 0) && (bytes < kilobyte)) {
            return bytes + ' B';
     
        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
            return (bytes / kilobyte).toFixed(precision) + ' KB';
     
        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
            return (bytes / megabyte).toFixed(precision) + ' MB';
     
        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
            return (bytes / gigabyte).toFixed(precision) + ' GB';
     
        } else if (bytes >= terabyte) {
            return (bytes / terabyte).toFixed(precision) + ' TB';
     
        } else {
            return bytes + ' B';
        }
    }
    // addFile(file: File) {
    //     const uploadedFile = { fileId: null, fileName: null, fileUploadedDate: null, fileModifiedLast: null, fileSize: null, fileExtension: null, fileUrl: null }

    //       this.http.post<{ message: string, userfile: any }>('http://127.0.0.1:3000/upload', fileData, {reportProgress: true}).subscribe(
    //         (userFileData) => {
    //             uploadedFile.fileId = userFileData.userfile._id;
    //             uploadedFile.fileName = userFileData.userfile.name;
    //             uploadedFile.fileUploadedDate = userFileData.userfile.createdDate;
    //             uploadedFile.fileModifiedLast = userFileData.userfile.modifiedDate;
    //             uploadedFile.fileSize = bytesToSize(userFileData.userfile.size, 0.01);
    //             uploadedFile.fileExtension = userFileData.userfile.extension;
    //             uploadedFile.fileUrl = userFileData.userfile.filePath;
    //             this.uploadedFiles.push(uploadedFile);
    //             this.filesChanged.next(this.uploadedFiles.slice());

    //         });   
    // }

    
    getFile(id: string) {
        return {...this.uploadedFiles.find(file => 
            file.fileId === id)}
    }

    changeFile(fileData: any) {
        this.selectedFile.next(fileData);
    }
    getFiles() {
        this.http.get<{ message: string, files: any }>('http://127.0.0.1:3000/uploadedfiles').pipe(map((fileData) => {
            return fileData.files.map(uploadedFile => {
                return {
                    fileId: uploadedFile._id,
                    fileName: uploadedFile.name,
                    fileUploadedDate: uploadedFile.createdDate,
                    fileModifiedLast: uploadedFile.modifiedDate,
                    fileSize: this.bytesToSize(uploadedFile.size, 0.01),
                    fileExtension: uploadedFile.extension,
                    fileUrl: uploadedFile.filePath,
                    fileCreator: uploadedFile.creator
                }
            })
        })).subscribe((transformedFiles) => {
            console.log("UP",this.uploadedFiles)
            this.uploadedFiles = transformedFiles
            this.filesChanged.next([...this.uploadedFiles]);
        }),
        catchError(this.handleError)
    }

    
    renameFile(fileId, newName) {
        this.uploadedFiles.filter(file => {
            file.fileId === fileId;
            file.fileName = newName;
        })

        this.http.put('http://127.0.0.1:3000/files/' + fileId, newName).subscribe(
            (updatedData) => {
                console.log(updatedData);
                // const renamedFile = this.uploadedFiles.filter(file => file.fileId === fileId)

                this.filesChanged.next(this.uploadedFiles.slice());
            }
        )
    }

    downloadFile(filePath: string) {
        this.http.get(filePath, { responseType: 'blob'}).subscribe((res) => {
            window.open(window.URL.createObjectURL(res));
          }
          );
    }

    deleteFile(fileId:string) {
        this.http.delete('http://127.0.0.1:3000/files/' + fileId).subscribe(
            () => {
                this.uploadedFiles = this.uploadedFiles.filter(file => file.fileId !== fileId);
                this.filesChanged.next(this.uploadedFiles.slice());
            }, 
            error => {
                console.log("Error occured ", error);
            }
        );
    }

    deleteRecentFile(fileId:string) {
        this.http.delete('http://127.0.0.1:3000/files/' + fileId).subscribe(
            () => {
                this.recentFiles = this.recentFiles.filter(file => file.fileId !== fileId);
                this.filesChanged.next(this.recentFiles.slice());
            }, 
            error => {
                console.log("Error occured ", error);
            }
        );
    }

    private handleError(err: HttpErrorResponse) {
        let errorMessage = '';
        if(err.error instanceof ErrorEvent) {
            errorMessage = `An error occured: ${err.error.message}`;
        }
        else {
            errorMessage = `Server error code: ${err.status}, error message is: ${err.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    public upload(files: Set<File>): { [key: string]: { progress: Observable<number> } } {
        const status: { [key: string]: { progress: Observable<number> } } = {};
    
        files.forEach(file => {
        const uploadedFile = { fileId: null, fileName: null, fileUploadedDate: null, fileModifiedLast: null, fileSize: null, fileExtension: null, fileUrl: null, fileCreator: null}
          const formData: FormData = new FormData();
          formData.append('userFile', file, file.name);
    
          const req = new HttpRequest('POST', 'http://127.0.0.1:3000/upload', formData, {
            reportProgress: true
          })
          const progress = new Subject<number>();    
          this.http.request<{ message: string, userfile: any }>(req).subscribe(event => {
            if (event.type === HttpEventType.UploadProgress) {    
              const percentDone = Math.round((100 * event.loaded) / event.total);
              progress.next(percentDone);
            } else if (event instanceof HttpResponse) {
              progress.complete(); 
              this.getFiles();
            
            }
          });
       
            status[file.name] = {
                progress: progress.asObservable()
              };

        });

            return status;
      }

      getRecentFiles(){
        this.http.get<{ message: string, files: any }>('http://127.0.0.1:3000/recentFiles').pipe(map((fileData) => {
            return fileData.files.map(recentFile => {
                return {
                    fileId: recentFile._id,
                    fileName: recentFile.name,
                    fileUploadedDate: recentFile.createdDate,
                    fileModifiedLast: this.datediff(this.datePipe.transform(recentFile.modifiedDate, 'MM-dd-yyyy HH:mm:ss'), this.datePipe.transform(Date.now(), 'MM-dd-yyyy HH:mm:ss')),
                    fileSize: recentFile.size,
                    fileExtension: recentFile.extension,
                    fileUrl: recentFile.filePath
                }
            })
        })).subscribe((transformedFiles) => {
            this.recentFiles = transformedFiles
            this.filesChanged.next([...this.recentFiles]);
        }),
        catchError(this.handleError)
      }

      parseDateTime(str) {
        console.log("Date and time",str)
        let mdy_hms = str.split(' ');
        return {
            date: this.parseDate(mdy_hms[0]),
            time: this.ParseTime(mdy_hms[1])
        }
    } 
    parseDate(str) {
        console.log("Date only",str)
        let mdy = str.split('-');
        return new Date(mdy[2], mdy[0]-1, mdy[1]);
    }
    ParseTime(str) {
        console.log("time only",str)
        let hms = str.split(':');
        return {
            hrs: hms[0],
            mm: hms[1],
            ss: hms[2]
        }
    }
 

    
    datediff(first, second) {
        const firstDate = this.parseDateTime(first).date;
        const firstTime = this.parseDateTime(first).time;

        const secondDate = this.parseDateTime(second).date;
        const secondTime = this.parseDateTime(second).time;

        let difference =  Math.round((+(secondDate)- +(firstDate))/(1000*60*60*24));
        if(difference >= 1) {
            console.log("iffff")
            return difference + 'days';
        }
        else if(difference < 1){
            console.log("else ifff")
            console.log("SS", secondTime.hrs);
            console.log("FF", firstTime.hrs)
            difference = Math.round((secondTime.hrs - firstTime.hrs));
            if(difference >= 1) {
                return difference + 'hrs';
            }
            else {
                difference = Math.round((secondTime.mm - firstTime.mm));
                if(difference >= 1) {
                    return difference + 'min';
                }
                else {
                    console.log("elseeee")
                    difference = Math.round((secondTime.ss - firstTime.ss));
                    return difference + 'sec'
                }
            }
        }
       
    }
}
