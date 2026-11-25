/**
 * Shared database error classes.
 *
 * All repository implementations throw one of these typed errors
 * instead of raw database driver exceptions, so callers can handle them
 * without coupling to a specific ORM or driver.
 */

/**
 * Base class for all database-layer errors.
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * Thrown when a lookup by ID or filter returns no document.
 */
export class RecordNotFoundError extends DatabaseError {
  constructor(message = "Record not found.") {
    super(message);
    this.name = "RecordNotFoundError";
  }
}

/**
 * Thrown when an insert or update would violate a unique constraint.
 */
export class DuplicateRecordError extends DatabaseError {
  constructor(message = "A record with the given identifier already exists.") {
    super(message);
    this.name = "DuplicateRecordError";
  }
}

/**
 * Thrown when an operation would violate a database constraint
 * other than uniqueness (e.g. foreign key, check constraint).
 */
export class DatabaseConstraintError extends DatabaseError {
  constructor(message = "Database constraint violation.") {
    super(message);
    this.name = "DatabaseConstraintError";
  }
}
