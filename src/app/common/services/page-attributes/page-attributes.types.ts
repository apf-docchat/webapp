export interface PageAttributes {
  hasUserNav: boolean;
  hasSidebar: boolean;
  hasNavbar: boolean;
}

enum PageLayout {
  BLANK = 'blank',
  NAVBAR_ONLY = 'navbar-only',
  INNER_PAGE = 'inner-page',
}

export interface PageBehaviorConfig {
  layout?: PageLayout;
}
