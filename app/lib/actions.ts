'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
        id: z.string(),
        customersId: z.string(),
        amount: z.coerce.number(),
        status: z.enum(['pending', 'paid']),
        date: z.string(),
});

const CreateInvoice = FormSchema.omit({id:true, date: true});

export async function createInvoice(formData: FormData){
        try {
                const { customersId, amount, status } = CreateInvoice.parse({
                        customersId: formData.get('customerId'),
                        amount: formData.get('amount'),
                        status: formData.get('status'),
                });
                const amountInCents = amount * 100;
                const date = new Date().toISOString().split('T')[0];

                await sql`INSERT INTO invoices (customer_id, amount, status, date)
                        VALUES (${customersId}, ${amountInCents}, ${status}, ${date})`;
                revalidatePath('/dashboard/invoices');
        } catch(err){
                return { message : 'Database Error: Failed to create Invoice.'};
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
        } catch(err:any){
                console.log(Object.keys(err));
                console.log(err['digest']);
                return { message : 'Database Error: Failed to update Invoice.'};
        }
}

export async function deleteInvoice(id: string, form: FormData){
        throw new Error('Failed');
        try{
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        } catch(e){
                return { message : 'Database Error: Failed to delete Invoice.'};
        }
        redirect('/dashboard/invoices');
}
