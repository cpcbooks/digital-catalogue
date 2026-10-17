-- Align controlled publication vocabulary with the approved CPC Publication Master.
-- This changes validation only; existing publication values are retained.
begin;

alter table public.publications
  drop constraint if exists publications_book_type_check,
  add constraint publications_book_type_check check (book_type = any (array[
    'Textbook', 'Reader', 'Semester Book', 'Workbook', 'Writing Book',
    'Activity Book', 'Drawing Book', 'Rhymes Book', 'Guide', 'Combined Guide',
    'Question Bank', 'Assessment Book', 'Map Book'
  ]));

alter table public.publications
  drop constraint if exists publications_status_check,
  add constraint publications_status_check check (status = any (array[
    'Active', 'Upcoming', 'Inactive', 'Discontinued', 'Out of Print', 'Archived'
  ]));

commit;
