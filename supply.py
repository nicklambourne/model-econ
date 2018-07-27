import numpy as np

from bokeh.io import curdoc
from bokeh.layouts import row, widgetbox
from bokeh.models import ColumnDataSource
from bokeh.models.widgets import Slider, Div
from bokeh.plotting import figure

max_dims = 40

N = 200

supply_intercept = 0
supply_gradient = 1
supply_x = np.linspace(0, max_dims, N)
supply_y = supply_gradient * supply_x + supply_intercept
supply_source = ColumnDataSource(data=dict(x=supply_x, y=supply_y))

demand_intercept = max_dims
demand_gradient = -1
demand_x = np.linspace(0, max_dims, N)
demand_y = demand_gradient * demand_x + demand_intercept
demand_source = ColumnDataSource(data=dict(x=demand_x, y=demand_y))

equilibrium_x = [max_dims / 2]
equilibrium_y = [max_dims / 2]
equilibrium_source = ColumnDataSource(data=dict(x=equilibrium_x, y=equilibrium_y))

equilibrium_vertical_x = np.linspace(max_dims / 2, max_dims / 2, N)
equilibrium_vertical_y = np.linspace(0, max_dims / 2, N)
equilibrium_vertical_source = ColumnDataSource(data=dict(x=equilibrium_vertical_x,
                                                         y=equilibrium_vertical_y))

equilibrium_horizontal_x = np.linspace(0, max_dims / 2, N)
equilibrium_horizontal_y = np.linspace(max_dims / 2, max_dims / 2, N)
equilibrium_horizontal_source = ColumnDataSource(data=dict(x=equilibrium_horizontal_x,
                                                           y=equilibrium_horizontal_y))

plot = figure(plot_height=600,
              plot_width=600,
              title="Interactive Demand & Supply",
              x_axis_label="Quantity (units)",
              y_axis_label="Price ($)",
              tools="",
              x_range=[0, max_dims], y_range=[0, max_dims])

plot.toolbar.logo = None

plot.line('x', 'y', source=supply_source, line_width=3, line_alpha=0.6, line_color="red")
plot.line('x', 'y', source=demand_source, line_width=3, line_alpha=0.6, line_color="blue")
plot.line('x', 'y', source=equilibrium_vertical_source, line_width=3, line_alpha=0.6,
          line_color="green", line_dash="dashed")
plot.line('x', 'y', source=equilibrium_horizontal_source, line_width=3, line_alpha=0.6,
          line_color="green", line_dash="dashed")
plot.circle('x', 'y', source=equilibrium_source, size=20, color="green", alpha=0.8)

# Widgets
supply = Slider(title="Increase/Decrease Supply", value=0.0, start=-20.0, end=20.0, step=1)
demand = Slider(title="Increase/Decrease Demand", value=0.0, start=-20.0, end=20.0, step=1)
supply_elasticity = Slider(title="Supply Elasticity", value=1.0, start=0.1, end=10.0, step=0.1)
demand_elasticity = Slider(title="Demand Elasticity", value=1.0, start=0.1, end=10.0, step=0.1)
equilibrium = Div(text=f"Equilibrium Price: ${equilibrium_y[0]} <br/>"
                       f"Equilibrium Quantity: {equilibrium_x[0]} units")


def update_text(equilibrium=equilibrium, new_x=equilibrium_x[0], new_y=equilibrium_y[0]):
    equilibrium.text = f"Equilibrium Price: ${round(new_y, 2)} <br/>" \
                       f"Equilibrium Quantity: {round(new_x, 2)} units"


def update_data(attribute_name, old, new):
    supply_delta = supply.value
    supply_gradient = supply_elasticity.value
    supply_intercept = 0 + supply_delta
    new_supply_y = (supply_gradient * supply_x) + supply_intercept
    supply_source.data = dict(x=supply_x, y=new_supply_y)

    demand_delta = demand.value
    demand_gradient = -demand_elasticity.value
    demand_intercept = max_dims + demand_delta
    new_demand_y = (demand_gradient * demand_x) + demand_intercept
    demand_source.data = dict(x=demand_x, y=new_demand_y)

    new_equilibrium_x = (demand_intercept - supply_intercept) / (supply_gradient - demand_gradient)
    new_equilibrium_y = new_equilibrium_x * demand_gradient + demand_intercept
    equilibrium_source.data = dict(x=[new_equilibrium_x], y=[new_equilibrium_y])

    print(f'equilibrium ({round(new_equilibrium_x, 2)}, {round(new_equilibrium_y, 2)})')
    print(f'demand ({round(demand_gradient, 2)}x+{round(demand_intercept, 2)})')
    print(f'supply ({round(supply_gradient, 2)}x+{round(supply_intercept, 2)})')

    new_equilibrium_vertical_x = np.linspace(new_equilibrium_x, new_equilibrium_x, N)
    new_equilibrium_vertical_y = np.linspace(0, new_equilibrium_y, N)
    equilibrium_vertical_source.data = dict(x=new_equilibrium_vertical_x,
                                            y=new_equilibrium_vertical_y)

    new_equilibrium_horizontal_x = np.linspace(0, new_equilibrium_x, N)
    new_equilibrium_horizontal_y = np.linspace(new_equilibrium_y, new_equilibrium_y, N)
    equilibrium_horizontal_source.data = dict(x=new_equilibrium_horizontal_x,
                                              y=new_equilibrium_horizontal_y)

    update_text(new_x=new_equilibrium_x, new_y=new_equilibrium_y)


for widget in [supply, demand, supply_elasticity, demand_elasticity]:
    widget.on_change('value', update_data)

inputs = widgetbox(supply, demand, supply_elasticity, demand_elasticity, equilibrium)

curdoc().add_root(row(inputs, plot, width=800))
curdoc().title = "Interactive Demand & Supply"
