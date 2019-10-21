import { FileLoaderLoadException } from './FileLoaderLoadException';

/**
 * Exception for when a circular reference is detected when importing resources.
 */
export class FileLoaderImportCircularReferenceException extends FileLoaderLoadException {}
