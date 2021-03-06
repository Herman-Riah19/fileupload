import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import multer from 'multer';
import path from 'path';
import {FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY} from './keys';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class FileuploadApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  /*Configure 'multer' options for file upload*/
  protected configureFileUpload(destination?: string) {
    destination = destination ?? path.join(__dirname, '../asset');
    this.bind(STORAGE_DIRECTORY).to(destination);

    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    };

    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
