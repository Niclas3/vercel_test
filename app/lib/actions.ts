'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
        prevState: string | undefined,
        formData: FormData,
){
        try{
                await signIn('credentials', formData);
        } catch (error){
                if(error instanceof AuthError){
                        switch(error.type){
                                case 'CredentialsSignin':
                                        return 'Invalid credentials.';
                                default:
                                        return 'Something went wrong.';
                        }
                }
                throw error;
        }
}

export type State = {
        errors?: {
                customersId?: string[];
                amount?: string[];
                status?: string[];
        };
        message?: string | null;
};

const FormSchema = z.object({
        id: z.string(),
        customersId: z.string({
                invalid_type_error: 'Please select a customer.',
        }),
        amount: z.coerce.number().gt(0,{
                message: 'Please enter an amount greater than $0.'
        }),
        status: z.enum(['pending', 'paid'],{
                invalid_type_error: 'Please select an invoice status.',
        }),
        date: z.string(),
});

const CreateInvoice = FormSchema.omit({id:true, date: true});

export async function createInvoice(prevState: State, formData: FormData){
        try {
                const validatedFields = CreateInvoice.safeParse({
                        customersId: formData.get('customerId'),
                        amount: formData.get('amount'),
                        status: formData.get('status'),
                });
                if(!validatedFields.success){
                        return {
                                errors: validatedFields.error.flatten().fieldErrors,
                                message: 'Missing Fields. Failed to Create Invoice.',
                        };
                }

                const { customersId, amount, status } = validatedFields.data;
                
                const amountInCents = amount * 100;
                const date = new Date().toISOString().split('T')[0];

                await sql`INSERT INTO invoices (customer_id, amount, status, date)
                        VALUES (${customersId}, ${amountInCents}, ${status}, ${date})`;
                revalidatePath('/dashboard/invoices');
        } catch(e){
                return { message : 'Database Error: Failed to create Invoice.', error: e};
        }
        redirect('/dashboard/invoices');
}
// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
 
export async function updateInvoice(id: string, formData: FormData) {
        try{
                const { customersId, amount, status } = UpdateInvoice.parse({
                customersId: formData.get('customerId'),
                amount: formData.get('amount'),
                status: formData.get('status'),
                });
                
                const amountInCents = amount * 100;
                
                await sql`
                UPDATE invoices
                SET customer_id = ${customersId}, amount = ${amountInCents}, status = ${status}
                WHERE id = ${id}
                `;
                
                revalidatePath('/dashboard/invoices');
                redirect('/dashboard/invoices');
        } catch(err){
                throw err;
                // return { message : 'Database Error: Failed to update Invoice.', error: err};
        }
}

export async function deleteInvoice(id: string, _: FormData){
        try{
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        } catch(e){
                throw e;
                // return { message : 'Database Error: Failed to delete Invoice.', error: e};
        }
        redirect('/dashboard/invoices');
}
