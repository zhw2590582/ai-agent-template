create policy "Users can delete own conversations"
  on public.conversations
  for delete
  using (auth.uid() = user_id);
