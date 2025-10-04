export interface ResultSuccess<T = unknown> {
	success: boolean;
	err?: T;
}