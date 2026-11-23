import { css } from 'lit';

export const careStyle = css`
:host {
  container-type: inline-size;
}
.care-rows {
  display: grid;
  grid-template-columns: 1fr;
  padding: 4px 8px 8px;
}
@container (min-width: 600px) {
  .care-rows {
    grid-template-columns: 1fr 1fr;
    column-gap: 28px;
  }
}
.care-row {
  padding: 8px 4px;
  border-bottom: 1px solid var(--divider-color, rgba(114, 114, 114, 0.25));
}
.care-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-height: 36px;
}
.care-row-head ha-icon {
  color: var(--secondary-text-color);
  flex: none;
}
.care-row-title {
  font-weight: 500;
  flex: none;
}
.care-row-status {
  color: var(--secondary-text-color);
  flex: 1;
  min-width: 0;
}
.care-row.alert .care-row-head ha-icon,
.care-row.alert .care-row-title,
.care-row.alert .care-row-status {
  color: var(--error-color, #db4437);
}
.care-row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}
.care-row-sub {
  color: var(--secondary-text-color);
  font-size: 0.9em;
  margin: 2px 0 0 32px;
}
.care-row .care-text {
  margin: 4px 0 0 32px;
}
.care-progress {
  height: 4px;
  margin: 4px 0 0 32px;
  border-radius: 2px;
  background-color: var(--divider-color, rgba(114, 114, 114, 0.25));
  overflow: hidden;
}
.care-progress > div {
  height: 100%;
  background-color: var(--primary-color);
}
.care-progress > div.overdue {
  background-color: var(--error-color, #db4437);
}
.care-button {
  font: inherit;
  font-size: 0.9em;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid var(--primary-color);
  cursor: pointer;
}
.care-button.outlined {
  background: none;
  color: var(--primary-color);
}
.care-button.solid {
  background-color: var(--primary-color);
  color: var(--text-primary-color, #fff);
}
.care-icon-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--secondary-text-color);
}
.care-snooze-menu {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}
.care-hint {
  grid-column: 1 / -1;
  padding: 8px 4px;
  color: var(--secondary-text-color);
}
.care-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
`;
