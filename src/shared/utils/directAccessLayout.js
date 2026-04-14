export function resolveDirectAccessGroupSpan(itemsCount) {
  if (itemsCount >= 3) return 3;
  if (itemsCount === 2) return 2;
  return 1;
}

function resolvePairSpans(firstGroup, secondGroup) {
  const firstNaturalSpan = resolveDirectAccessGroupSpan(firstGroup.items.length);
  const secondNaturalSpan = resolveDirectAccessGroupSpan(secondGroup.items.length);

  if (firstNaturalSpan === 1 && secondNaturalSpan === 1) {
    return [2, 1];
  }

  if (firstNaturalSpan + secondNaturalSpan <= 3) {
    return [firstNaturalSpan, secondNaturalSpan];
  }

  if (firstGroup.items.length >= secondGroup.items.length) {
    return [2, 1];
  }

  return [1, 2];
}

export function buildDirectAccessGroupLayouts(groupEntries) {
  const groups = groupEntries.map(([groupName, items]) => ({
    groupName,
    items,
  }));
  const layouts = [];

  for (let index = 0; index < groups.length; ) {
    const remaining = groups.length - index;

    if (remaining === 1) {
      layouts.push({
        ...groups[index],
        span: 3,
        columns: resolveDirectAccessGroupSpan(groups[index].items.length),
      });
      index += 1;
      continue;
    }

    if (remaining === 2) {
      const [firstSpan, secondSpan] = resolvePairSpans(
        groups[index],
        groups[index + 1],
      );

      layouts.push({
        ...groups[index],
        span: firstSpan,
        columns: resolveDirectAccessGroupSpan(groups[index].items.length),
      });
      layouts.push({
        ...groups[index + 1],
        span: secondSpan,
        columns: resolveDirectAccessGroupSpan(groups[index + 1].items.length),
      });
      break;
    }

    if (
      remaining === 3 &&
      groups
        .slice(index, index + 3)
        .every((group) => resolveDirectAccessGroupSpan(group.items.length) === 1)
    ) {
      for (const group of groups.slice(index, index + 3)) {
        layouts.push({
          ...group,
          span: 1,
          columns: 1,
        });
      }
      break;
    }

    layouts.push({
      ...groups[index],
      span: resolveDirectAccessGroupSpan(groups[index].items.length),
      columns: resolveDirectAccessGroupSpan(groups[index].items.length),
    });
    index += 1;
  }

  return layouts;
}
