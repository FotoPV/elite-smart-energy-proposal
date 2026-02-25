-- Migration: Replace hasGas with hasSolarNew and hasSolarOld in customers table
ALTER TABLE `customers` 
  ADD COLUMN IF NOT EXISTS `hasSolarNew` boolean DEFAULT false COMMENT 'Has Solar PV <5yrs',
  ADD COLUMN IF NOT EXISTS `hasSolarOld` boolean DEFAULT false COMMENT 'Has Solar PV >5yrs';
