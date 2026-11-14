<script setup lang="ts">
/**
 * Inline Cloudflare mark.
 *
 * Deliberately inline rather than an <img> from cloudflare.com: ad blockers and
 * privacy extensions routinely block third-party asset requests, and a missing
 * logo next to a security warning makes the warning look broken.
 */
withDefaults(
  defineProps<{
    size?: number;
    withWordmark?: boolean;
  }>(),
  { size: 20, withWordmark: false }
);
</script>

<template>
  <span class="inline-flex items-center gap-2 align-middle">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Cloudflare"
      xmlns="http://www.w3.org/2000/svg"
      class="shrink-0"
    >
      <path
        fill="#F6821F"
        d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0361-.0489 2.158-.8867 2.5507-1.9024l.4986-1.2988a.2933.2933 0 0 0 .0146-.168c-.5625-2.5424-2.8306-4.4443-5.5366-4.4443-2.4946 0-4.6118 1.6157-5.3711 3.8535a2.6237 2.6237 0 0 0-1.794-.4966c-1.2026.1191-2.1665 1.083-2.2861 2.2856a2.7 2.7 0 0 0 .0596.8892C1.5654 13.1592 0 14.7803 0 16.7686c0 .1794.0142.3564.0352.5312a.1755.1755 0 0 0 .1694.1495h15.9814a.2182.2182 0 0 0 .2076-.1592z"
      />
      <path
        fill="#FBAD41"
        d="M19.2529 10.7793c-.0796 0-.1626.002-.2422.0073a.1358.1358 0 0 0-.1128.0952l-.3403 1.1836c-.1475.5068-.0908.9707.1553 1.3154.2246.3164.6045.499 1.0615.5206l1.8457.1123c.0552 0 .1055.0263.1338.0713a.1618.1618 0 0 1 .0195.1562c-.0278.084-.1123.1485-.2036.1563l-1.9199.1123c-1.0429.0488-2.1582.8867-2.5507 1.9023l-.1387.3584c-.0273.0703.0224.1406.0986.1406h6.6045a.1691.1691 0 0 0 .1631-.1231A4.87 4.87 0 0 0 24 15.6396c0-2.6798-2.1758-4.8603-4.7471-4.8603"
      />
    </svg>
    <span
      v-if="withWordmark"
      class="text-[11px] font-semibold tracking-wide text-gray-300"
      >Cloudflare</span
    >
  </span>
</template>
