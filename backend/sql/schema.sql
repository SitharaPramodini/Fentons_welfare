/* ===========================================================================
 * WELFARE SOCIETY OF FENTONS - database schema
 *
 * Source forms:
 *   WFR/F/09/2020 Rev 02 - Membership Application Form
 *   WFR/LOAN/2013        - Loan Application
 *
 * Every column below comes from a field on one of those two forms. The few
 * exceptions are marked `web only` and exist because an online submission
 * needs things a paper form does not: a reference number to quote back, an
 * e-mail address to acknowledge to, and a status to track progress.
 *
 * Run with:  mysql -u <user> -p < backend/sql/schema.sql
 *       or:  cd backend && npm run db:init
 * =========================================================================== */

CREATE DATABASE IF NOT EXISTS `Welfare_Society_Fentons`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `Welfare_Society_Fentons`;


/* --- Membership applications ---------------------------------------------
 * One row per application. The applicant becomes a member when `status`
 * moves to 'approved'; the submitted form is kept either way.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `members` (
  `id`                        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `reference_no`              VARCHAR(32)   NULL,            /* web only: WSF-M-2026-0001 */
  `form_revision`             VARCHAR(40)   NOT NULL DEFAULT 'WFR/F/09/2020 Rev 02',

  /* Member details */
  `full_name`                 VARCHAR(150)  NOT NULL,
  `permanent_address`         VARCHAR(255)  NOT NULL,
  `date_of_birth`             DATE          NOT NULL,
  `nic_number`                VARCHAR(20)   NOT NULL,
  `contact_number`            VARCHAR(20)   NOT NULL,
  `email`                     VARCHAR(150)  NULL,            /* web only: acknowledgement address */
  `spouse_name`               VARCHAR(150)  NULL,

  /* Declaration - membership requested with effect from this date */
  `membership_effective_from` DATE          NOT NULL,
  `declaration_accepted`      TINYINT(1)    NOT NULL DEFAULT 0,
  `signed_date`               DATE          NULL,

  /* Clause 4.3 - the applicant agrees to abide by the Constitution. Recorded
   * with the moment of agreement so it can be evidenced later. */
  `constitution_accepted`     TINYINT(1)    NOT NULL DEFAULT 0,
  `constitution_accepted_at`  DATETIME      NULL,

  /* Consent to the entrance fee and monthly subscription being deducted
   * from salary until further notice. Clause 4.4 sets them at Rs. 250.00
   * and Rs. 200.00; both are stored per row so a later revision does not
   * rewrite what an existing member agreed to. */
  `payroll_deduction_consent` TINYINT(1)    NOT NULL DEFAULT 0,
  `joining_fee`               DECIMAL(10,2) NOT NULL DEFAULT 250.00,
  `monthly_fee`               DECIMAL(10,2) NOT NULL DEFAULT 200.00,

  /* FOR HR DIVISION */
  `company`                   ENUM('Fentons','EnergyNet','FSF','HEL') NOT NULL,
  `division`                  VARCHAR(100)  NOT NULL,
  `epf_number`                VARCHAR(20)   NOT NULL,
  `employment_category`       ENUM('Non-Executive','Executive')       NOT NULL,
  `hris`                      INT UNSIGNED  NULL,   /* the signed-in member who submitted this */

  /* Processing */
  `status`                    ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `hr_remarks`                VARCHAR(500)  NULL,
  `processed_by`              VARCHAR(150)  NULL,
  `processed_at`              DATETIME      NULL,

  `created_at`                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_members_reference` (`reference_no`),
  UNIQUE KEY `uq_members_nic`       (`nic_number`),
  UNIQUE KEY `uq_members_epf`       (`epf_number`),
  KEY `ix_members_hris`    (`hris`),
  KEY `ix_members_status`  (`status`),
  KEY `ix_members_name`    (`full_name`),
  KEY `ix_members_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Dependants named on the membership form ------------------------------
 * Covers both columns of the form: the parents / parents-in-law block
 * (recorded if they are alive) and the children block (unmarried children
 * below 21 years and children over 06 months). One table, distinguished by
 * `relationship`.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `member_dependants` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id`     INT UNSIGNED NOT NULL,
  `relationship`  ENUM('Mother','Father','Mother-In-Law','Father-In-Law','Child') NOT NULL,
  `full_name`     VARCHAR(150) NOT NULL,
  `nic_number`    VARCHAR(20)  NULL,   /* parents: collected to verify a death donation claim */
  `date_of_birth` DATE         NULL,   /* children: evidences the 06 months / 21 years rule */
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `ix_dependants_member` (`member_id`),
  CONSTRAINT `fk_dependants_member`
    FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Declining membership -------------------------------------------------
 * The lower half of the membership form, addressed to the Secretary, by
 * which an employee records that they do not wish to join the Society.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `membership_declinations` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name`   VARCHAR(150) NOT NULL,
  `epf_number`  VARCHAR(20)  NULL,
  `company`     ENUM('Fentons','EnergyNet','FSF','HEL') NULL,
  `division`    VARCHAR(100) NULL,
  `declined_on` DATE         NOT NULL,
  `reason`      VARCHAR(500) NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `ix_declinations_epf` (`epf_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Loan applications ----------------------------------------------------
 * Sections 1-3, 5 and 7 are the applicant's. Section 6 is FOR OFFICE USE
 * ONLY and is written only by the Exco decision and release endpoints.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `loan_applications` (
  `id`                        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `reference_no`              VARCHAR(32)   NULL,   /* web only: WSF-L-2026-0001 */
  `form_revision`             VARCHAR(40)   NOT NULL DEFAULT 'WFR/LOAN/2013',
  `member_id`                 INT UNSIGNED  NULL,   /* matched on EPF number when the applicant is a member */

  /* 1) PERSONAL DETAILS */
  `title`                     ENUM('Mr','Mrs','Miss') NOT NULL,
  `full_name`                 VARCHAR(150)  NOT NULL,
  `date_of_birth`             DATE          NOT NULL,
  `identity_type`             ENUM('NIC','DL','Passport') NOT NULL DEFAULT 'NIC',
  `identity_number`           VARCHAR(30)   NOT NULL,
  `telephone`                 VARCHAR(20)   NOT NULL,
  `email`                     VARCHAR(150)  NULL,   /* web only */

  /* 2) EMPLOYMENT DETAILS */
  `date_joined`               DATE          NOT NULL,
  `epf_number`                VARCHAR(20)   NOT NULL,
  `designation`               VARCHAR(120)  NOT NULL,
  `years_of_service`          DECIMAL(4,1)  NULL,
  `division`                  VARCHAR(100)  NOT NULL,
  `date_joined_society`       DATE          NULL,
  `hris`                      INT UNSIGNED  NULL,   /* the signed-in member who submitted this */

  /* 3) FACILITY REQUIRED */
  `loan_purpose`              VARCHAR(500)  NOT NULL,
  `loan_amount`               DECIMAL(12,2) NOT NULL,

  /* 5) DECLARATION */
  `declaration_accepted`      TINYINT(1)    NOT NULL DEFAULT 0,
  `applicant_signed_date`     DATE          NULL,

  /* 6) FOR OFFICE USE ONLY */
  `fund_raising_contribution` TINYINT(1)    NULL,
  `exco_remarks`              VARCHAR(500)  NULL,
  `released_on`               DATE          NULL,
  `amount_released`           DECIMAL(12,2) NULL,
  `authorized_by_1`           VARCHAR(150)  NULL,
  `authorized_by_2`           VARCHAR(150)  NULL,
  `authorized_date`           DATE          NULL,

  /* 7) PAYROLL DEDUCTION */
  `payroll_deduction_consent` TINYINT(1)    NOT NULL DEFAULT 0,
  `payroll_deduction_amount`  DECIMAL(12,2) NULL,
  `payroll_signed_date`       DATE          NULL,

  /* 'approved' and 'not_approved' are the two Exco Approval boxes. */
  `status` ENUM('submitted','under_review','approved','not_approved','released','settled')
           NOT NULL DEFAULT 'submitted',
  `decided_by` VARCHAR(150) NULL,
  `decided_at` DATETIME     NULL,

  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_loans_reference` (`reference_no`),
  KEY `ix_loans_member`  (`member_id`),
  KEY `ix_loans_hris`    (`hris`),
  KEY `ix_loans_epf`     (`epf_number`),
  KEY `ix_loans_status`  (`status`),
  KEY `ix_loans_created` (`created_at`),
  CONSTRAINT `fk_loans_member`
    FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- 4) SECURITY - guarantor ----------------------------------------------
 * The form provides one guarantor block. A child table is used anyway so a
 * second guarantor can be required later without a schema change.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `loan_guarantors` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loan_id`              INT UNSIGNED NOT NULL,
  `full_name`            VARCHAR(150) NOT NULL,
  `date_joined`          DATE         NULL,
  `division`             VARCHAR(100) NULL,
  `designation`          VARCHAR(120) NULL,
  `epf_number`           VARCHAR(20)  NULL,
  `identity_type`        ENUM('NIC','DL','Passport') NOT NULL DEFAULT 'NIC',
  `identity_number`      VARCHAR(30)  NOT NULL,
  `telephone`            VARCHAR(20)  NOT NULL,
  `declaration_accepted` TINYINT(1)   NOT NULL DEFAULT 0,
  `signed_date`          DATE         NULL,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `ix_guarantors_loan` (`loan_id`),
  KEY `ix_guarantors_epf`  (`epf_number`),
  CONSTRAINT `fk_guarantors_loan`
    FOREIGN KEY (`loan_id`) REFERENCES `loan_applications` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Sign-in credentials --------------------------------------------------
 * Staff sign in with their HRIS number, which lives in the Company's HR
 * database (`intranet.employee`). That database is read-only to this
 * application, so passwords are kept here instead, keyed by HRIS.
 *
 * A member has no row until their first sign-in: until then the only password
 * that works is the one derived from their HRIS and date of birth. Redeeming
 * it creates the row below with `must_change_password` set.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `auth_users` (
  `hris`                 INT UNSIGNED NOT NULL,
  `password_hash`        VARCHAR(255) NOT NULL,
  `must_change_password` TINYINT(1)   NOT NULL DEFAULT 1,
  `last_login_at`        DATETIME     NULL,
  `failed_attempts`      INT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until`         DATETIME     NULL,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`hris`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Supporting documents -------------------------------------------------
 * Birth and marriage certificates submitted with a membership application.
 *
 * The files themselves live on disk outside the web root (see
 * utils/uploads.js); only their metadata is here. `stored_name` is a random
 * name generated at upload time - `original_name` is what the member called
 * the file and is kept for display only, never used to build a path.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `member_documents` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id`     INT UNSIGNED NOT NULL,
  `doc_type`      ENUM('birth_certificate','spouse_birth_certificate','marriage_certificate') NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name`   VARCHAR(255) NOT NULL,
  `mime_type`     VARCHAR(100) NOT NULL,
  `size_bytes`    INT UNSIGNED NOT NULL,
  `uploaded_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_member_document` (`member_id`, `doc_type`),
  KEY `ix_documents_member` (`member_id`),
  CONSTRAINT `fk_documents_member`
    FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Consents -------------------------------------------------------------
 * Every consent a member gives, with the exact words they agreed to.
 *
 * `consent_text` is stored in full on purpose. Consent is only evidence if
 * you can show what was actually agreed to, and the wording changes over
 * time - a record that merely pointed at today's text would misrepresent
 * what somebody agreed to two years ago. `version` makes those changes
 * traceable.
 *
 * Nothing here is ever deleted when wording changes; a withdrawal is
 * recorded by setting `withdrawn_at`, not by removing the row.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `consents` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hris`            INT UNSIGNED NULL,          /* who gave it */
  `member_id`       INT UNSIGNED NULL,          /* the application it belongs to */
  `loan_id`         INT UNSIGNED NULL,
  `consent_type`    ENUM('special_personal_data','constitution','declaration','payroll_deduction') NOT NULL,
  `consent_version` VARCHAR(16)  NOT NULL,
  `consent_text`    TEXT         NOT NULL,      /* the exact wording agreed to */
  `granted`         TINYINT(1)   NOT NULL DEFAULT 1,
  `granted_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `withdrawn_at`    DATETIME     NULL,
  `ip_address`      VARCHAR(45)  NULL,          /* 45 covers IPv6 */
  `user_agent`      VARCHAR(255) NULL,

  PRIMARY KEY (`id`),
  KEY `ix_consents_hris`   (`hris`),
  KEY `ix_consents_member` (`member_id`),
  KEY `ix_consents_loan`   (`loan_id`),
  KEY `ix_consents_type`   (`consent_type`),
  KEY `ix_consents_when`   (`granted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/* --- Audit trail ----------------------------------------------------------
 * What happened, who did it, and when.
 *
 * Deliberately append-only in practice: rows are written and never updated,
 * so the trail can be relied on. `detail` holds whatever is worth keeping
 * about one event, as JSON, rather than forcing every kind of event into the
 * same columns.
 *
 * It records that a document was read, not what was in it.
 * ------------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `occurred_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action`      VARCHAR(64)  NOT NULL,          /* e.g. loan.approved */
  `actor_hris`  INT UNSIGNED NULL,              /* null when the system acted */
  `actor_name`  VARCHAR(150) NULL,
  `entity_type` VARCHAR(32)  NULL,              /* member | loan | document | consent | auth */
  `entity_id`   INT UNSIGNED NULL,
  `summary`     VARCHAR(255) NOT NULL,          /* one readable line */
  `detail`      JSON         NULL,
  `ip_address`  VARCHAR(45)  NULL,
  `user_agent`  VARCHAR(255) NULL,

  PRIMARY KEY (`id`),
  KEY `ix_audit_when`   (`occurred_at`),
  KEY `ix_audit_action` (`action`),
  KEY `ix_audit_actor`  (`actor_hris`),
  KEY `ix_audit_entity` (`entity_type`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
