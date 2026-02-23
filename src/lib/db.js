import { supabase } from "./supabase";

/**
 * DATABASE SCHEMA (Run this in Supabase SQL Editor):
 *
 * -- CLEAN START (Deleta tabelas existentes se houver)
 * drop table if exists expense_items;
 * drop table if exists shopping_sessions;
 *
 * create table shopping_sessions (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   user_id uuid references auth.users(id) default auth.uid(),
 *   title text not null,
 *   split_count integer default 2,
 *   total_shared_cost decimal(10,2) default 0,
 *   total_personal_cost decimal(10,2) default 0
 * );
 *
 * create table expense_items (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   session_id uuid references shopping_sessions(id) on delete cascade,
 *   name text not null,
 *   price decimal(10,2) not null,
 *   quantity integer default 1,
 *   is_personal boolean default false
 * );
 *
 * create table fixed_bills (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   user_id uuid references auth.users(id) default auth.uid(),
 *   title text not null,
 *   amount decimal(10,2) not null,
 *   due_day integer default 10,
 *   month_year text not null,
 *   is_paid boolean default false,
 *   split_count integer default 2
 * );
 *
 * alter table fixed_bills enable row level security;
 * create policy "Users can see their own bills" on fixed_bills for select to authenticated using (auth.uid() = user_id);
 * create policy "Users can insert their own bills" on fixed_bills for insert to authenticated with check (auth.uid() = user_id);
 * create policy "Users can update their own bills" on fixed_bills for update to authenticated using (auth.uid() = user_id);
 * create policy "Users can delete their own bills" on fixed_bills for delete to authenticated using (auth.uid() = user_id);
 */

export const db = {
  sessions: {
    async list() {
      const { data, error } = await supabase
        .from("shopping_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    async create(title, splitCount = 2) {
      const { data, error } = await supabase
        .from("shopping_sessions")
        .insert([{ title, split_count: splitCount }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from("shopping_sessions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    async updateTotals(id, sharedTotal, personalTotal) {
      const { error } = await supabase
        .from("shopping_sessions")
        .update({
          total_shared_cost: sharedTotal,
          total_personal_cost: personalTotal,
        })
        .eq("id", id);
      if (error) throw error;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from("shopping_sessions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },
  items: {
    async list(sessionId) {
      const { data, error } = await supabase
        .from("expense_items")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    async add(item) {
      const { data, error } = await supabase
        .from("expense_items")
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from("expense_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  },
  fixedBills: {
    async list(monthYear) {
      let query = supabase
        .from("fixed_bills")
        .select("*")
        .order("due_day", { ascending: true });

      if (monthYear) {
        query = query.eq("month_year", monthYear);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async create(bill) {
      const { data, error } = await supabase
        .from("fixed_bills")
        .insert([bill])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from("fixed_bills")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from("fixed_bills")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  },
};
