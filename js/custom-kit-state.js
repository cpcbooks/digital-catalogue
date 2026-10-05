/* Cambridge Digital Catalogue — Custom Kit working-state helper.
   This holds only in-memory selection/completion rules; page UI and storage stay separate. */
(function (global) {
  "use strict";

  function itemId(itemOrId) {
    const value = itemOrId && typeof itemOrId === "object" ? itemOrId.id : itemOrId;
    return value === null || value === undefined ? "" : String(value);
  }

  function configuredMinimum(value) {
    if (value === null || value === undefined || value === "") return null;
    const minimum = Number(value);
    if (!Number.isSafeInteger(minimum) || minimum < 1) throw new Error("Custom Kit minimum must be a positive integer.");
    return minimum;
  }

  function create(options) {
    const minimum = configuredMinimum(options && options.minimum);
    const completionEnabled = minimum !== null && !(options && options.completionEnabled === false);
    const eligible = options && typeof options.isEligible === "function" ? options.isEligible : () => true;
    const selected = new Map();
    let name = "";

    function add(item) {
      const id = itemId(item);
      if (!id || selected.has(id) || !eligible(item)) return false;
      selected.set(id, item);
      return true;
    }

    function remove(itemOrId) {
      return selected.delete(itemId(itemOrId));
    }

    function contains(itemOrId) {
      return selected.has(itemId(itemOrId));
    }

    function count() { return selected.size; }
    function selectedIds() { return [...selected.keys()]; }
    function selectedItems() { return [...selected.values()]; }
    function remaining() { return minimum === null ? null : Math.max(minimum - count(), 0); }
    function canReview() { return count() > 0; }
    function isComplete() { return completionEnabled && count() >= minimum; }
    function setName(value) { name = String(value || "").replace(/\s+/g, " ").trim().slice(0, 80); return name; }
    function getName() { return name; }

    return Object.freeze({
      minimum,
      completionEnabled,
      add,
      remove,
      contains,
      count,
      selectedIds,
      selectedItems,
      remaining,
      canReview,
      isComplete,
      setName,
      getName
    });
  }

  global.CambridgeCustomKitState = Object.freeze({ create });
})(window);
