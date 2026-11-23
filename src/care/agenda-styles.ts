import { css } from 'lit';

/* The header follows HA's own cards (entities, to-do list); rows and buttons follow the flower care card. */
export const agendaStyle = css`
:host {
  display: block;
}
ha-card {
  padding-bottom: 8px;
}
.card-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  color: var(--ha-card-header-color, var(--primary-text-color));
  font-family: var(--ha-card-header-font-family, inherit);
  font-size: var(--ha-card-header-font-size, 24px);
  letter-spacing: -0.012em;
  line-height: 32px;
  padding: 24px 16px 16px;
  margin: 0;
  font-weight: normal;
}
.card-header .name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agenda-summary {
  flex: none;
  font-size: 14px;
  letter-spacing: normal;
  color: var(--secondary-text-color);
}
.agenda-summary b {
  font-weight: 500;
  color: var(--error-color, #db4437);
}
.agenda-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 12px;
}
.agenda-chip {
  font: inherit;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--outline-color, var(--divider-color));
  background: none;
  color: var(--primary-text-color);
  cursor: pointer;
}
.agenda-chip ha-icon {
  --mdc-icon-size: 18px;
}
.agenda-chip[aria-pressed="true"] {
  background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
  border-color: var(--primary-color);
}
.agenda-group + .agenda-group {
  border-top: 1px solid var(--divider-color);
}
.agenda-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 16px 0;
  font-weight: 500;
  color: var(--secondary-text-color);
}
.agenda-group-head.overdue {
  color: var(--error-color, #db4437);
}
.agenda-count {
  font-weight: 400;
}
.agenda-spacer {
  flex: 1;
}
.agenda-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px 16px;
  padding: 0 8px 8px;
}
.agenda-body {
  container-type: inline-size;
}
@container (min-width: 620px) {
  .agenda-rows {
    grid-template-columns: 1fr 1fr;
  }
}
.agenda-item {
  min-width: 0;
}
.agenda-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 4px 8px;
  border-radius: 8px;
}
.agenda-row.alert {
  background: rgba(var(--rgb-error-color, 219, 68, 55), 0.12);
}
.agenda-thumb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
  cursor: pointer;
}
.agenda-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-background-color);
  color: var(--secondary-text-color);
}
.agenda-text {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.agenda-what,
.agenda-when {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
}
.agenda-what {
  color: var(--primary-text-color);
}
.agenda-what ha-icon {
  --mdc-icon-size: 18px;
  color: var(--state-icon-color, var(--secondary-text-color));
  flex: none;
}
.agenda-plant {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}
.agenda-when {
  color: var(--secondary-text-color);
  font-size: 0.9em;
}
.agenda-when .predicted {
  font-style: italic;
}
.agenda-row.alert .agenda-what ha-icon,
.agenda-row.alert .agenda-when {
  color: var(--error-color, #db4437);
}
.agenda-tag {
  font-size: 0.8em;
  border: 1px solid currentColor;
  border-radius: 8px;
  padding: 0 5px;
}
.agenda-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}
.agenda-icon-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--secondary-text-color);
}
.care-button.small {
  font-size: 0.8em;
  padding: 2px 10px;
}
.agenda-snooze-menu {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 8px 4px;
}
.agenda-empty {
  padding: 8px 16px 16px;
  text-align: center;
  color: var(--secondary-text-color);
}
.agenda-empty ha-icon {
  color: var(--success-color, #43a047);
}
.agenda-later {
  padding: 8px 16px 4px;
  border-top: 1px solid var(--divider-color);
  color: var(--secondary-text-color);
}
.agenda-later button {
  font: inherit;
  background: none;
  border: none;
  padding: 0;
  color: var(--primary-color);
  cursor: pointer;
}
`;
