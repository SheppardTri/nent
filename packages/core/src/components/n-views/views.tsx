import {
  Component,
  h,
  Host,
  Method,
  Prop,
  State,
  writeTask,
} from '@stencil/core'
import { actionBus, eventBus } from '../../services/actions'
import { commonState, debugIf } from '../../services/common'
import { RouterService } from './services/router'
import { routingState } from './services/state'

/**
 * The root component is the base container for the view-engine and its
 * child components. This element should contain root-level HTML that
 * is global to every view along with \<n-view\>
 * components placed within any global-html.
 *
 * @system routing
 * @extension actions
 * @extension elements
 * @extension provider
 */
@Component({
  tag: 'n-views',
  styleUrl: 'views.css',
  shadow: false,
})
export class ViewRouter {
  @State() didStart: boolean = false
  /**
   * This is the root path that the actual page is,
   * if it isn't '/', then the router needs to know
   * where to begin creating paths.
   */
  @Prop() root: string = '/'

  /**
   * Navigation transition between routes.
   * This is a CSS animation class.
   */
  @Prop() transition?: string

  /**
   * This is the application / site title.
   * If the views or dos have titles,
   * this is added as a suffix.
   */
  @Prop() appTitle?: string

  /**
   * This is the start path a user should
   * land on when they first land on this app.
   */
  @Prop() startPath?: string

  /**
   * This is the seconds to wait before
   * redirecting to the start path.
   */
  @Prop() startDelay: number = 0

  /**
   * Header height or offset for scroll-top on this
   * and all views.
   */
  @Prop() scrollTopOffset?: number

  /**
   * Kick of the start-page immediately.
   */
  @Method()
  public async start() {
    if (!this.didStart) {
      debugIf(commonState.debug, 'n-views: start-path')
      routingState.router!.finalize(this.startPath)
      this.didStart = true
    }
  }

  componentWillLoad() {
    commonState.routingEnabled = true
    routingState.router = new RouterService(
      window,
      writeTask,
      eventBus,
      actionBus,
      this.root,
      this.appTitle,
      this.transition,
      this.scrollTopOffset,
    )
  }

  componentDidLoad() {
    debugIf(commonState.debug, 'n-views: initialized')
    if (this.startDelay > 0)
      setTimeout(() => {
        this.start()
      }, this.startDelay * 1000)
    else this.start()
  }

  disconnectedCallback() {
    commonState.routingEnabled = false
    routingState.router?.destroy()
  }

  render() {
    return <Host></Host>
  }
}
