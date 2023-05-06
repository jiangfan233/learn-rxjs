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

关于 fakeRepeatWhen(repeatWhen) 的问题：
<ul>
    <li>
        期望：</br>
        1、controller$数据流complete的时候能够下游也能正常结束，<br/>
        2、controller$数据流complete的时候能够在重新订阅自身
    </li>
    <li>
        实际：<br/>
        1、controller$数据流只是不再产生数据，不再调用nextFunc了<br/>
        2、实际上当controller$数据流complete的时候，并没有调用observer.complete,即下游并没有被通知到。</br>
        3、而且因为递归中缺少判断条件，会导致无限循环
    </li>
    <li>
        解决方法：<br/>
        当一个Observable 还有数据产生时，会先调用observer.next，
        然后在某一个时刻调用 observer.complete<br/>
        如果该Observable 已经没有数据，会直接调用 observer.complete<br/>
        所以只需要维护一个根据 observer.next 是否调用的来改变状态的状态变量即可<br/>
        该变量同时也表示Observable是否已经complete
    </li>

</ul>