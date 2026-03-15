import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactFormSubmission {
    subject: string;
    fullName: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface backendInterface {
    getContacts(): Promise<Array<ContactFormSubmission>>;
    submitContact(fullName: string, email: string, subject: string, message: string): Promise<void>;
}
