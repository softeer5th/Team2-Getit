export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Not Found";
	}
}

export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Bad Request";
	}
}

export class ForbiddenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Forbidden";
	}
}

export enum ERROR_STATUS {
	NOT_FOUND = 404,
	BAD_REQUEST = 400,
	FORBIDDEN = 403,
	INTERNAL_ERROR = 500,
}
