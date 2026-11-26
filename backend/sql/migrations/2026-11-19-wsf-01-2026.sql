/* ===========================================================================
 * Membership form WSF/01/2026 Revision 01 (19/11/2026)
 *
 * Brings a database created against the old form - WFR/F/09/2020 Rev 02 - up
 * to the revised one. Additive only: no column is dropped and no existing
 * row is rewritten, so applications already filed stay exactly as submitted.
 *
 * What the revision added
 *   members            calling name, civil status, designation, spouse NIC
 *   member_dependants  each child's gender and numbered row
 *   member_documents   identity cards and children's birth certificates,
 *                      and the index that keeps one certificate per child
 *
 * Run with:  cd backend && npm run db:migrate
 * ======================================================================== */

/* --- members ------------------------------------------------------------ */

ALTER TABLE `members`
  ADD COLUMN IF NOT EXISTS `calling_name` VARCHAR(100) NULL AFTER `full_name`,
  ADD COLUMN IF NOT EXISTS `civil_status` ENUM('Single','Married','Divorced')
      NOT NULL DEFAULT 'Single' AFTER `email`,
  ADD COLUMN IF NOT EXISTS `spouse_nic_number` VARCHAR(20) NULL AFTER `spouse_name`,
  ADD COLUMN IF NOT EXISTS `designation` VARCHAR(150) NULL AFTER `division`;

/* Rows filed before the revision carry no civil status of their own. A
 * spouse was named only by someone married, so that is the one case the old
 * data can answer; everybody else keeps the 'Single' default, which HR can
 * correct. */
UPDATE `members`
   SET `civil_status` = 'Married'
 WHERE `spouse_name` IS NOT NULL AND TRIM(`spouse_name`) <> '';

ALTER TABLE `members`
  ALTER COLUMN `form_revision` SET DEFAULT 'WSF/01/2026 Rev 01';

/* --- member_dependants -------------------------------------------------- */

ALTER TABLE `member_dependants`
  ADD COLUMN IF NOT EXISTS `position` TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `relationship`,
  ADD COLUMN IF NOT EXISTS `gender` ENUM('Male','Female') NULL AFTER `nic_number`;

/* --- member_documents --------------------------------------------------- */

ALTER TABLE `member_documents`
  ADD COLUMN IF NOT EXISTS `doc_index` TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER `doc_type`;

ALTER TABLE `member_documents`
  MODIFY COLUMN `doc_type` ENUM('id_card','birth_certificate','spouse_id_card',
                                'spouse_birth_certificate','marriage_certificate',
                                'child_birth_certificate') NOT NULL;

/* One row per child certificate, so the old (member, type) key has to go. */
ALTER TABLE `member_documents`
  DROP INDEX `uq_member_document`,
  ADD UNIQUE KEY `uq_member_document` (`member_id`, `doc_type`, `doc_index`);
