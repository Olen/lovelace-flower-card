import { css } from 'lit';

/** Done buttons and the early-Done dialog, shared by both cards. */
export const careButtonStyle = css`
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
.care-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
`;

export const nextCareStyle = css`
.next-care {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 0 8px 8px;
}
.next-care-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-text-color);
}
.next-care-item ha-icon {
  --mdc-icon-size: 20px;
  margin-left: 5px;
}
.next-care-item.alert {
  color: var(--error-color, #db4437);
}
.next-care-item .care-button {
  padding: 2px 10px;
}
`;

export const careStyle = css`
:host {
  display: block;
}
.care-body {
  container-type: inline-size;
}
.care-rows {
  display: grid;
  grid-template-columns: 1fr;
  padding: 4px 8px 8px;
}
@container (min-width: 460px) {
  .care-rows {
    grid-template-columns: 1fr 1fr;
    column-gap: 28px;
  }
  /* Keeps Light | Soil paired when Prune or Light is hidden */
  .care-row-light {
    grid-column: 1;
  }
  .care-row-soil {
    grid-column: 2;
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
.care-row.alert {
  background: rgba(var(--rgb-error-color, 219, 68, 55), 0.12);
  border-bottom-color: transparent;
  border-radius: 6px;
  padding: 8px;
  margin: 2px 0;
}
/* Folded rows sit as tight as the flower card's bars, so the two cards line up */
.care-row.folded {
  padding: 3px 4px;
}
.care-row.folded .care-row-head {
  min-height: 28px;
}
.care-row.alert.folded {
  padding: 3px 8px;
  margin: 1px 0;
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
.care-progress > div.moisture {
  background-color: var(--info-color, #039be5);
}
.care-progress > div.overdue {
  background-color: var(--error-color, #db4437);
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
`;
