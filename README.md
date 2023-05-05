跟着《深入浅出Rxjs》学rxjs，看完一本再说。

rxjs既实现了观察者模式又实现了迭代器模式；

观察者模式：
<ul>
<li>
作为一个controller把数据源（用户行为）和处理器（handler）通过source$.subscribe(observer)结合在一起；
</li>
<li>通过运算符组建数据流通管道处理数据；</li>
</ul>
迭代器模式：
<ul>
<li>数据源要求观察者（subscriber）必须实现next、complete、error中至少一个方法，从而保证数据流通；</li>
<li>source$.subscribe(observer)观察者作为参数交给数据源，保证观察者“随时可用”</li>
</ul>


高阶函数可用来保存执行上下文context,从而摆脱this困扰,但也因此不能直接使用链式调用；

repeatWhen 有问题待解决，